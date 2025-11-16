/**
 * File: src/lfm/lfmController.js
 * Description: HTTP controllers for Last.fm OAuth, link status and playlist sessions.
 * Author: João Aranha
 * Last-Modified: 2025-11-15
 * Version: v1.5.0 (Discord session-aware + multi-account)
 */

'use strict';

const lfmService = require('./lfmService');

/**
 * Resolves the Discord ID associated with the current request.
 *
 * Priority:
 *  1) Discord session created by Discord OAuth (/lfm/auth/discord/*)
 *  2) Explicit discordId in query string
 *  3) Explicit discordId in request body
 */
function resolveDiscordIdFromRequest(req) {
  if (req.session && req.session.discordIdentity && req.session.discordIdentity.discordId) {
    return req.session.discordIdentity.discordId;
  }

  if (req.query && req.query.discordId) {
    return req.query.discordId;
  }

  if (req.body && req.body.discordId) {
    return req.body.discordId;
  }

  return null;
}

/**
 * GET /lfm/connect
 * Returns the Last.fm authorization URL for a given Discord user.
 * Works with either:
 *  - Discord session (preferred), or
 *  - Explicit ?discordId=<id> for legacy flows.
 */
exports.connectLastfm = async (req, res) => {
  try {
    const discordId = resolveDiscordIdFromRequest(req);

    if (!discordId) {
      return res.status(400).json({
        success: false,
        message: 'Missing Discord identity. You must be logged in with Discord or provide discordId.'
      });
    }

    const authUrl = await lfmService.getAuthorizationUrl(discordId);

    return res.status(200).json({
      success: true,
      message: 'Use the provided URL to redirect the user to Last.fm authorization page.',
      data: {
        authUrl
      }
    });
  } catch (error) {
    console.error('Error in /lfm/connect:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate Last.fm authorization URL.'
    });
  }
};

/**
 * GET /lfm/callback
 * Handles the Last.fm callback and links the Last.fm account to the Discord user.
 * Expects:
 *  - token: Last.fm temporary token (required)
 *  - Discord identity from session or ?discordId=<id>
 */
exports.lastfmCallback = async (req, res) => {
  try {
    const { token } = req.query;
    const discordId = resolveDiscordIdFromRequest(req);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: token.'
      });
    }

    if (!discordId) {
      return res.status(400).json({
        success: false,
        message: 'Missing Discord identity. You must be logged in with Discord or provide discordId.'
      });
    }

    const result = await lfmService.handleCallback(discordId, token);

    return res.status(200).json({
      success: true,
      message: 'Last.fm account linked successfully.',
      data: result
    });
  } catch (error) {
    console.error('Error in /lfm/callback:', error);

    // Known 4xx errors (e.g., maximum 5 accounts) are surfaced as-is.
    if (error.isKnown === true && error.httpStatusCode) {
      return res.status(error.httpStatusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to complete Last.fm linking process.'
    });
  }
};

/**
 * GET /lfm/status
 * Returns linking status of the Last.fm accounts for a given Discord user.
 * Now returns an array of accounts instead of a single one.
 */
exports.lastfmStatus = async (req, res) => {
  try {
    const discordId = resolveDiscordIdFromRequest(req);

    if (!discordId) {
      return res.status(400).json({
        success: false,
        message: 'Missing Discord identity. You must be logged in with Discord or provide discordId.'
      });
    }

    const links = await lfmService.getLinkStatus(discordId);

    if (!links) {
      return res.status(200).json({
        success: true,
        message: 'No Last.fm account is linked to this user.',
        data: {
          linked: false,
          accounts: []
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Last.fm linking status retrieved successfully.',
      data: {
        linked: true,
        accounts: links
      }
    });
  } catch (error) {
    console.error('Error in /lfm/status:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Last.fm link status.'
    });
  }
};

/**
 * POST /lfm/session/start
 * Starts a playlist session that will later be validated using Last.fm scrobbles.
 * Body:
 *  - playlistId (required)
 *  - startLink (required)
 *  - challengeTrackId (required)
 *  - challengeTrackName (required)
 *  - challengeTrackArtist (required)
 *  - webplayerHmac (required)
 *  - windowMinutes (required)
 *  - lastfmUsername (optional, choose which Last.fm account to use)
 *  - discordId (optional if Discord session is active)
 */
exports.startSession = async (req, res) => {
  try {
    const {
      discordId: bodyDiscordId,
      playlistId,
      startLink,
      challengeTrackId,
      challengeTrackName,
      challengeTrackArtist,
      webplayerHmac,
      windowMinutes,
      lastfmUsername
    } = req.body || {};

    const discordId = bodyDiscordId || resolveDiscordIdFromRequest(req);

    if (!discordId) {
      return res.status(400).json({
        success: false,
        message: 'Missing Discord identity. You must be logged in with Discord or provide discordId.'
      });
    }

    if (!playlistId || !startLink || !challengeTrackId || !challengeTrackName || !challengeTrackArtist || !webplayerHmac || !windowMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for starting session.'
      });
    }

    const session = await lfmService.startSession({
      discordId,
      playlistId,
      startLink,
      challengeTrackId,
      challengeTrackName,
      challengeTrackArtist,
      webplayerHmac,
      windowMinutes,
      lastfmUsername
    });

    return res.status(200).json({
      success: true,
      message: 'Playlist session started successfully.',
      data: session
    });
  } catch (error) {
    console.error('Error in /lfm/session/start:', error);

    if (error.isKnown === true && error.httpStatusCode) {
      return res.status(error.httpStatusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to start Last.fm validation session.'
    });
  }
};

/**
 * POST /lfm/session/collect-scrobbles
 * Collects scrobbles for a given session, either synchronously (debug/manual)
 * or asynchronously via the job queue.
 * Body:
 *  - sessionId (required)
 *  - mode: 'sync' | 'async' (default: 'async')
 *  - discordId (optional if Discord session is active)
 */
exports.collectScrobbles = async (req, res) => {
  try {
    const { sessionId, discordId: bodyDiscordId, mode } = req.body || {};
    const discordId = bodyDiscordId || resolveDiscordIdFromRequest(req);
    const effectiveMode = mode || 'async';

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: sessionId.'
      });
    }

    if (!discordId) {
      return res.status(400).json({
        success: false,
        message: 'Missing Discord identity. You must be logged in with Discord or provide discordId.'
      });
    }

    // Legacy "sync" mode – useful for debug/manual usage.
    if (effectiveMode === 'sync') {
      const result = await lfmService.collectScrobblesForSession(sessionId, discordId);

      return res.status(200).json({
        success: true,
        message: 'Scrobbles collected successfully (sync mode).',
        data: result
      });
    }

    // Default: asynchronous via job queue.
    const job = await lfmService.enqueueScrobbleCollection(sessionId, discordId);

    return res.status(202).json({
      success: true,
      message: 'Scrobble collection job enqueued (async mode).',
      data: job
    });
  } catch (error) {
    console.error('Error in /lfm/session/collect-scrobbles:', error);

    if (error.isKnown === true && error.httpStatusCode) {
      return res.status(error.httpStatusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to collect Last.fm scrobbles for this session.'
    });
  }
};
