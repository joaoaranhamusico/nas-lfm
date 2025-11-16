/**
 * File: src/lfm/lfmService.js
 * Description: Last.fm OAuth logic, database integration for user_lastfm_links and playlist sessions.
 * Author: João Aranha
 * Last-Modified: 2025-11-14
 * Version: v1.4.0 (multi-conta + fila de jobs para coleta + pipeline)
 */

'use strict';

const crypto = require('crypto');
const axios = require('axios');
const path = require('path');

const pool = require(path.join(__dirname, '..', 'config', 'database'));
const jobQueue = require('./jobQueue');

// Environment variables for Last.fm API.
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_API_SECRET = process.env.LASTFM_API_SECRET;
const LASTFM_CALLBACK_URL = process.env.LASTFM_CALLBACK_URL;

/**
 * Generates the Last.fm authorization URL for a given Discord user.
 * The Discord ID is propagated as a query param in the callback URL.
 */
async function getAuthorizationUrl(discordId) {
  if (!LASTFM_API_KEY || !LASTFM_CALLBACK_URL) {
    throw new Error('Last.fm configuration is missing. Check LASTFM_API_KEY and LASTFM_CALLBACK_URL.');
  }

  const callbackUrl = new URL(LASTFM_CALLBACK_URL);
  callbackUrl.searchParams.set('discordId', discordId);

  const authUrl =
    'https://www.last.fm/api/auth/' +
    `?api_key=${encodeURIComponent(LASTFM_API_KEY)}` +
    `&cb=${encodeURIComponent(callbackUrl.toString())}`;

  return authUrl;
}

/**
 * Generates the API signature required by Last.fm.
 */
function generateApiSignature(params, apiSecret) {
  const keys = Object.keys(params).sort();
  let signatureBase = '';

  keys.forEach((key) => {
    signatureBase += key + params[key];
  });

  signatureBase += apiSecret;

  return crypto.createHash('md5').update(signatureBase).digest('hex');
}

/**
 * Exchanges the temporary Last.fm token for a sessionKey and username.
 */
async function exchangeTokenForSession(token) {
  if (!LASTFM_API_KEY || !LASTFM_API_SECRET) {
    throw new Error('Last.fm API credentials are missing. Check LASTFM_API_KEY and LASTFM_API_SECRET.');
  }

  const params = {
    api_key: LASTFM_API_KEY,
    method: 'auth.getSession',
    token
  };

  const apiSig = generateApiSignature(params, LASTFM_API_SECRET);

  const response = await axios.get('https://ws.audioscrobbler.com/2.0/', {
    params: {
      ...params,
      api_sig: apiSig,
      format: 'json'
    },
    timeout: 10000
  });

  if (!response.data || !response.data.session) {
    throw new Error('Invalid response from Last.fm when fetching session.');
  }

  const sessionKey = response.data.session.key;
  const lastfmUsername = response.data.session.name;

  if (!sessionKey || !lastfmUsername) {
    throw new Error('Missing sessionKey or username in Last.fm response.');
  }

  return { sessionKey, lastfmUsername };
}

/**
 * Internal helper to mark errors that are safe to expose to clients as 4xx.
 */
function createKnownError(message, httpStatusCode = 400) {
  const error = new Error(message);
  error.isKnown = true;
  error.httpStatusCode = httpStatusCode;
  return error;
}

/**
 * Creates or updates a Last.fm link for a given Discord user and Last.fm username.
 * Supports up to 5 distinct Last.fm accounts per Discord ID.
 */
async function linkUserLastfm(discordId, lastfmUsername, sessionKey) {
  // 1) Check if this specific Last.fm username is already linked for this Discord user
  const existingQuery = `
    SELECT id
    FROM user_lastfm_links
    WHERE discord_id = $1
      AND lastfm_username = $2
  `;
  const existingResult = await pool.query(existingQuery, [discordId, lastfmUsername]);
  const existingLink = existingResult.rows[0];

  // 2) If it does not exist yet, ensure we have not reached the maximum of 5 accounts
  if (!existingLink) {
    const countQuery = `
      SELECT COUNT(*)::INT AS total
      FROM user_lastfm_links
      WHERE discord_id = $1
    `;
    const countResult = await pool.query(countQuery, [discordId]);
    const total = countResult.rows[0]?.total || 0;

    if (total >= 5) {
      throw createKnownError('You have reached the maximum number of linked Last.fm accounts (maximum 5).', 400);
    }
  }

  const query = `
    INSERT INTO user_lastfm_links (discord_id, lastfm_username, session_key)
    VALUES ($1, $2, $3)
    ON CONFLICT (discord_id, lastfm_username)
    DO UPDATE SET
      session_key = EXCLUDED.session_key,
      updated_at  = NOW()
    RETURNING id, discord_id, lastfm_username, is_active, created_at, updated_at;
  `;

  const values = [discordId, lastfmUsername, sessionKey];

  const result = await pool.query(query, values);

  return result.rows[0];
}

/**
 * High-level handler used by the controller in /lfm/callback.
 */
async function handleCallback(discordId, token) {
  const { sessionKey, lastfmUsername } = await exchangeTokenForSession(token);
  const linkRow = await linkUserLastfm(discordId, lastfmUsername, sessionKey);

  return {
    id: linkRow.id,
    discord_id: linkRow.discord_id,
    lastfm_username: linkRow.lastfm_username,
    is_active: linkRow.is_active,
    created_at: linkRow.created_at,
    updated_at: linkRow.updated_at
  };
}

/**
 * Returns the Last.fm link status (all accounts) for a given Discord user.
 */
async function getLinkStatus(discordId) {
  const query = `
    SELECT id,
           discord_id,
           lastfm_username,
           is_active,
           created_at,
           updated_at
    FROM user_lastfm_links
    WHERE discord_id = $1
    ORDER BY created_at ASC;
  `;

  const result = await pool.query(query, [discordId]);

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows; // list of accounts
}

/**
 * Starts a new Last.fm-based playlist session.
 *
 * Supports multiple Last.fm accounts per Discord:
 * - If lastfmUsername is provided, the session will use that specific account.
 * - Otherwise, it will select the most recently updated active link as default.
 */
async function startSession({
  discordId,
  playlistId,
  startLink,
  challengeTrackId,
  challengeTrackName,
  challengeTrackArtist,
  webplayerHmac,
  windowMinutes,
  lastfmUsername
}) {
  let linkQuery;
  let linkParams;

  if (lastfmUsername) {
    // Explicitly chosen Last.fm account for this Discord user
    linkQuery = `
      SELECT id, discord_id, lastfm_username, is_active
      FROM user_lastfm_links
      WHERE discord_id = $1
        AND lastfm_username = $2
    `;
    linkParams = [discordId, lastfmUsername];
  } else {
    // Default behavior: pick most recent active link for this Discord user
    linkQuery = `
      SELECT id, discord_id, lastfm_username, is_active
      FROM user_lastfm_links
      WHERE discord_id = $1
      ORDER BY is_active DESC, updated_at DESC NULLS LAST, created_at DESC
      LIMIT 1
    `;
    linkParams = [discordId];
  }

  const linkResult = await pool.query(linkQuery, linkParams);

  if (linkResult.rowCount === 0) {
    if (lastfmUsername) {
      throw createKnownError('No Last.fm link found for this Discord user with the specified username.', 400);
    }

    throw createKnownError('No Last.fm link found for this Discord user. Please connect Last.fm first.', 400);
  }

  const link = linkResult.rows[0];

  if (!link.is_active) {
    throw createKnownError('Last.fm link is not active. Please contact an admin to activate your Last.fm account.', 400);
  }

  const effectiveWindowMinutes = Number.isFinite(windowMinutes) && windowMinutes > 0
    ? Math.floor(windowMinutes)
    : 105;

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + effectiveWindowMinutes * 60 * 1000);

  const insertQuery = `
    INSERT INTO lfm_playlist_sessions (
      user_lastfm_link_id,
      discord_id,
      lastfm_username,
      playlist_id,
      start_link,
      challenge_track_id,
      challenge_track_name,
      challenge_track_artist,
      webplayer_hmac,
      window_minutes,
      status,
      started_at,
      ends_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'OPEN', $11, $12)
    RETURNING
      id,
      user_lastfm_link_id,
      discord_id,
      lastfm_username,
      playlist_id,
      window_minutes,
      status,
      started_at,
      ends_at,
      created_at,
      updated_at;
  `;

  const values = [
    link.id,
    discordId,
    link.lastfm_username,
    playlistId,
    startLink,
    challengeTrackId || null,
    challengeTrackName || null,
    challengeTrackArtist || null,
    webplayerHmac || null,
    effectiveWindowMinutes,
    startedAt.toISOString(),
    endsAt.toISOString()
  ];

  const insertResult = await pool.query(insertQuery, values);
  const row = insertResult.rows[0];

  return {
    sessionId: row.id,
    discordId: row.discord_id,
    lastfmUsername: row.lastfm_username,
    playlistId: row.playlist_id,
    windowMinutes: row.window_minutes,
    status: row.status,
    startedAt: row.started_at,
    endsAt: row.ends_at
  };
}

/**
 * Fetch recent tracks from Last.fm for a given user and time window.
 */
async function fetchRecentTracks({ lastfmUsername, sessionKey, fromUnix, toUnix }) {
  if (!LASTFM_API_KEY) {
    throw new Error('Last.fm configuration is missing. Check LASTFM_API_KEY.');
  }

  const params = {
    method: 'user.getRecentTracks',
    api_key: LASTFM_API_KEY,
    user: lastfmUsername,
    from: fromUnix,
    to: toUnix,
    limit: 200,
    format: 'json',
    sk: sessionKey
  };

  const response = await axios.get('https://ws.audioscrobbler.com/2.0/', {
    params,
    timeout: 10000
  });

  if (!response.data || !response.data.recenttracks || !response.data.recenttracks.track) {
    return [];
  }

  const tracks = response.data.recenttracks.track;

  return Array.isArray(tracks) ? tracks : [tracks];
}

/**
 * Collect scrobbles for a given playlist session.
 * (Usado tanto em modo "sync" quanto pelo worker assíncrono)
 */
async function collectScrobblesForSession(sessionId, discordId) {
  const sessionQuery = `
    SELECT s.id, s.user_lastfm_link_id, s.discord_id, s.lastfm_username, s.started_at, s.ends_at, s.status,
           l.session_key
    FROM lfm_playlist_sessions s
    JOIN user_lastfm_links l ON l.id = s.user_lastfm_link_id
    WHERE s.id = $1
  `;
  const sessionResult = await pool.query(sessionQuery, [sessionId]);

  if (sessionResult.rowCount === 0) {
    throw createKnownError('Session not found.', 404);
  }

  const session = sessionResult.rows[0];

  if (session.discord_id !== discordId) {
    throw createKnownError('Session does not belong to this Discord user.', 403);
  }

  if (!session.session_key) {
    throw new Error('Session has no associated Last.fm session key.');
  }

  if (!session.started_at || !session.ends_at) {
    throw new Error('Session has invalid time window.');
  }

  const startedAt = new Date(session.started_at);
  const endsAt = new Date(session.ends_at);

  const fromUnix = Math.floor(startedAt.getTime() / 1000);
  const toUnix = Math.floor(endsAt.getTime() / 1000);

  const recentTracks = await fetchRecentTracks({
    lastfmUsername: session.lastfm_username,
    sessionKey: session.session_key,
    fromUnix,
    toUnix
  });

  let inserted = 0;
  let skipped = 0;

  for (const t of recentTracks) {
    if (!t.date || !t.date.uts) {
      continue;
    }

    const playedAt = new Date(parseInt(t.date.uts, 10) * 1000);

    const trackName = t.name || 'Unknown Track';
    const artistName = t.artist && t.artist['#text'] ? t.artist['#text'] : 'Unknown Artist';

    const artistMbid = t.artist && t.artist.mbid ? t.artist.mbid : null;
    const trackMbid = t.mbid || null;
    const albumName = t.album && t.album['#text'] ? t.album['#text'] : null;

    const insertQuery = `
      INSERT INTO lfm_scrobbles_raw (
        session_id,
        discord_id,
        lastfm_username,
        track_mbid,
        track_name,
        artist_mbid,
        artist_name,
        album_name,
        played_at,
        raw_payload
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (session_id, track_name, artist_name, played_at)
      DO UPDATE SET
        updated_at = NOW()
      RETURNING id;
    `;

    const values = [
      session.id,
      session.discord_id,
      session.lastfm_username,
      trackMbid,
      trackName,
      artistMbid,
      artistName,
      albumName,
      playedAt.toISOString(),
      t
    ];

    try {
      const result = await pool.query(insertQuery, values);

      if (result.rowCount > 0) {
        inserted += 1;
      } else {
        skipped += 1;
      }
    } catch (err) {
      console.error('Error inserting scrobble into lfm_scrobbles_raw:', err);
      skipped += 1;
    }
  }

  return {
    sessionId: session.id,
    discordId: session.discord_id,
    lastfmUsername: session.lastfm_username,
    totalFetchedFromLastfm: recentTracks.length,
    inserted,
    skipped
  };
}

/**
 * Enfileira um job para coletar scrobbles de uma sessão (modo assíncrono).
 */
async function enqueueScrobbleCollection(sessionId, discordId) {
  if (!sessionId || !discordId) {
    throw new Error('enqueueScrobbleCollection requires sessionId and discordId.');
  }

  const job = await jobQueue.enqueueJob('SCROBBLE_COLLECT', {
    sessionId,
    discordId,
    payload: { reason: 'manual_request_from_http' }
  });

  return job;
}

module.exports = {
  getAuthorizationUrl,
  handleCallback,
  getLinkStatus,
  startSession,
  collectScrobblesForSession,
  enqueueScrobbleCollection
};
