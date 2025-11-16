// File: src/lfm/pipeline/playPipeline.js
// Pipeline: lfm_scrobbles_raw -> scrobbles_preprocess -> plays_unverified -> plays_verified

'use strict';

const crypto = require('crypto');
const path = require('path');
const pool = require(path.join(__dirname, '..', '..', 'config', 'database'));

const HMAC_SECRET = process.env.LFM_PLAY_HMAC_SECRET || 'CHANGE_ME_IN_ENV';

// Heurística simples para duração (3min = 180000ms)
const DEFAULT_TRACK_DURATION_MS = 180000;

// Tolerâncias
const START_LINK_TOLERANCE_SECONDS = 120;  // 2 minutos
const END_TOLERANCE_SECONDS = 60;          // 1 minuto
const DENSITY_MIN_GAP_MS = 60000;          // 1 minuto entre plays
const SEQUENCE_TOLERANCE_MS = 5000;        // 5s

function normalizeString(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim();
}

/**
 * Passo 1: Preprocessar scrobbles da sessão.
 */
async function preprocessScrobblesForSession(sessionId) {
  const query = `
    SELECT r.id,
           r.session_id,
           r.discord_id,
           r.lastfm_username,
           r.track_name,
           r.artist_name,
           r.played_at
    FROM lfm_scrobbles_raw r
    LEFT JOIN scrobbles_preprocess p
      ON p.scrobble_id = r.id
    WHERE r.session_id = $1
      AND p.id IS NULL;
  `;

  const res = await pool.query(query, [sessionId]);

  if (res.rowCount === 0) {
    return 0;
  }

  const insertQuery = `
    INSERT INTO scrobbles_preprocess (
      scrobble_id,
      session_id,
      discord_id,
      lastfm_username,
      track_name_norm,
      artist_name_norm,
      played_at,
      duration_ms
    )
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id;
  `;

  let inserted = 0;

  for (const row of res.rows) {
    const values = [
      row.id,
      row.session_id,
      row.discord_id,
      row.lastfm_username,
      normalizeString(row.track_name),
      normalizeString(row.artist_name),
      row.played_at,
      DEFAULT_TRACK_DURATION_MS
    ];

    try {
      await pool.query(insertQuery, values);
      inserted++;
    } catch (err) {
      console.error('[PIPELINE] Error inserting into scrobbles_preprocess:', err);
    }
  }

  return inserted;
}

/**
 * Passo 2: Gerar plays_unverified a partir de scrobbles_preprocess.
 */
async function generateUnverifiedPlays(sessionId) {
  const query = `
    SELECT p.id,
           p.session_id,
           p.discord_id,
           p.lastfm_username,
           p.track_name_norm,
           p.artist_name_norm,
           p.played_at,
           p.duration_ms
    FROM scrobbles_preprocess p
    LEFT JOIN plays_unverified u
      ON u.scrobble_pre_id = p.id
    WHERE p.session_id = $1
      AND u.id IS NULL
    ORDER BY p.played_at ASC;
  `;

  const res = await pool.query(query, [sessionId]);
  if (res.rowCount === 0) {
    return 0;
  }

  const insertQuery = `
    INSERT INTO plays_unverified (
      session_id,
      discord_id,
      lastfm_username,
      track_name_norm,
      artist_name_norm,
      ts_start,
      ts_end,
      duration_ms,
      scrobble_pre_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id;
  `;

  let inserted = 0;

  for (const row of res.rows) {
    const tsEnd = new Date(row.played_at);
    const duration = row.duration_ms || DEFAULT_TRACK_DURATION_MS;
    const tsStart = new Date(tsEnd.getTime() - duration);

    const values = [
      row.session_id,
      row.discord_id,
      row.lastfm_username,
      row.track_name_norm,
      row.artist_name_norm,
      tsStart.toISOString(),
      tsEnd.toISOString(),
      duration,
      row.id
    ];

    try {
      await pool.query(insertQuery, values);
      inserted++;
    } catch (err) {
      console.error('[PIPELINE] Error inserting into plays_unverified:', err);
    }
  }

  return inserted;
}

/**
 * Passo 3: Rodar validações e gravar em plays_verified + validation_logs.
 */
async function runValidationsAndCommit(sessionId) {
  // 1) Carrega sessão
  const sessionQuery = `
    SELECT s.id,
           s.discord_id,
           s.lastfm_username,
           s.started_at,
           s.ends_at,
           s.challenge_track_name,
           s.challenge_track_artist,
           s.window_minutes
    FROM lfm_playlist_sessions s
    WHERE s.id = $1;
  `;
  const sessionRes = await pool.query(sessionQuery, [sessionId]);
  if (sessionRes.rowCount === 0) {
    throw new Error(`Session ${sessionId} not found`);
  }
  const session = sessionRes.rows[0];

  const startedAt = new Date(session.started_at);
  const endsAt = new Date(session.ends_at);
  const challengeTrackNameNorm = normalizeString(session.challenge_track_name);
  const challengeTrackArtistNorm = normalizeString(session.challenge_track_artist);

  // 2) Carrega plays_unverified da sessão, ordenados por ts_end
  const playsQuery = `
    SELECT *
    FROM plays_unverified
    WHERE session_id = $1
    ORDER BY ts_end ASC;
  `;
  const playsRes = await pool.query(playsQuery, [sessionId]);
  if (playsRes.rowCount === 0) {
    return 0;
  }

  let lastValidEnd = null;
  let committed = 0;

  for (const play of playsRes.rows) {
    const tsStart = new Date(play.ts_start);
    const tsEnd = new Date(play.ts_end);

    // VALIDAÇÃO: start_link (janela de sessão + tolerâncias)
    const startLinkMin = new Date(startedAt.getTime() - START_LINK_TOLERANCE_SECONDS * 1000);
    const endMax = new Date(endsAt.getTime() + END_TOLERANCE_SECONDS * 1000);

    const validStartLink =
      tsEnd.getTime() >= startLinkMin.getTime() &&
      tsEnd.getTime() <= endMax.getTime();

    // VALIDAÇÃO: challenge track (se definida)
    let validChallenge = true;
    if (challengeTrackNameNorm || challengeTrackArtistNorm) {
      validChallenge =
        play.track_name_norm === challengeTrackNameNorm &&
        play.artist_name_norm === challengeTrackArtistNorm;
    }

    // VALIDAÇÃO: densidade (evita scrobbles muito colados)
    let validDensity = true;
    if (lastValidEnd) {
      const diffMs = tsEnd.getTime() - lastValidEnd.getTime();
      if (diffMs < DENSITY_MIN_GAP_MS) {
        validDensity = false;
      }
    }

    // VALIDAÇÃO: sequência (não pode começar muito antes do fim do anterior)
    let validSequence = true;
    if (lastValidEnd) {
      const minStart = lastValidEnd.getTime() - SEQUENCE_TOLERANCE_MS;
      if (tsStart.getTime() < minStart) {
        validSequence = false;
      }
    }

    const globalValid = !!(validStartLink && validChallenge && validDensity && validSequence);

    // HMAC
    const hmacInput = [
      session.id,
      play.discord_id,
      play.lastfm_username,
      play.track_name_norm,
      play.artist_name_norm,
      tsStart.toISOString(),
      tsEnd.toISOString()
    ].join('|');

    const hmac = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(hmacInput)
      .digest('hex');

    // Insert em plays_verified (ON CONFLICT IGNORE)
    const insertVerifiedQuery = `
      INSERT INTO plays_verified (
        session_id,
        discord_id,
        lastfm_username,
        track_name_norm,
        artist_name_norm,
        ts_start,
        ts_end,
        duration_ms,
        valid_start_link,
        valid_challenge,
        valid_density,
        valid_sequence,
        global_valid,
        hmac_signature
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (session_id, track_name_norm, artist_name_norm, ts_end)
      DO NOTHING
      RETURNING id;
    `;

    const insertValues = [
      play.session_id,
      play.discord_id,
      play.lastfm_username,
      play.track_name_norm,
      play.artist_name_norm,
      tsStart.toISOString(),
      tsEnd.toISOString(),
      play.duration_ms,
      validStartLink,
      validChallenge,
      validDensity,
      validSequence,
      globalValid,
      hmac
    ];

    let verifiedId = null;
    try {
      const verifiedRes = await pool.query(insertVerifiedQuery, insertValues);
      if (verifiedRes.rowCount > 0) {
        verifiedId = verifiedRes.rows[0].id;
        committed++;
      }
    } catch (err) {
      console.error('[PIPELINE] Error inserting into plays_verified:', err);
    }

    // Logs de validação
    const vlogQuery = `
      INSERT INTO validation_logs (
        play_unverified_id,
        session_id,
        discord_id,
        validator,
        result,
        info
      )
      VALUES
        ($1,$2,$3,'start_link',$4,$5),
        ($1,$2,$3,'challenge',$6,$7),
        ($1,$2,$3,'density',$8,$9),
        ($1,$2,$3,'sequence',$10,$11);
    `;

    const vlogValues = [
      play.id,
      play.session_id,
      play.discord_id,
      validStartLink,
      JSON.stringify({ tsEnd: tsEnd.toISOString(), startedAt: startedAt.toISOString(), endsAt: endsAt.toISOString() }),
      validChallenge,
      JSON.stringify({
        playTrack: play.track_name_norm,
        playArtist: play.artist_name_norm,
        challengeTrackNameNorm,
        challengeTrackArtistNorm
      }),
      validDensity,
      JSON.stringify({ lastValidEnd: lastValidEnd ? lastValidEnd.toISOString() : null }),
      validSequence,
      JSON.stringify({ tsStart: tsStart.toISOString(), lastValidEnd: lastValidEnd ? lastValidEnd.toISOString() : null })
    ];

    try {
      await pool.query(vlogQuery, vlogValues);
    } catch (err) {
      console.error('[PIPELINE] Error inserting into validation_logs:', err);
    }

    if (globalValid && verifiedId) {
      lastValidEnd = tsEnd;
    }
  }

  // Opcional: marcar sessão como processada
  const updateSessionQuery = `
    UPDATE lfm_playlist_sessions
    SET status = 'PROCESSED',
        updated_at = NOW()
    WHERE id = $1;
  `;
  await pool.query(updateSessionQuery, [sessionId]);

  return committed;
}

/**
 * Função principal do pipeline para uma sessão.
 */
async function runPipelineForSession(sessionId) {
  console.log('[PIPELINE] Preprocessing scrobbles for session', sessionId);
  const pre = await preprocessScrobblesForSession(sessionId);
  console.log(`[PIPELINE] Preprocessed ${pre} scrobbles.`);

  console.log('[PIPELINE] Generating unverified plays for session', sessionId);
  const pu = await generateUnverifiedPlays(sessionId);
  console.log(`[PIPELINE] Generated ${pu} unverified plays.`);

  console.log('[PIPELINE] Running validations and committing verified plays for session', sessionId);
  const committed = await runValidationsAndCommit(sessionId);
  console.log(`[PIPELINE] Committed ${committed} verified plays.`);

  return {
    preprocessed: pre,
    unverifiedGenerated: pu,
    verifiedCommitted: committed
  };
}

module.exports = {
  runPipelineForSession
};
