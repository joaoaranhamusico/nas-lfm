// File: src/lfm/jobQueue.js
// Simple Postgres-backed job queue for the Last.fm sidecar.

'use strict';

const path = require('path');
const pool = require(path.join(__dirname, '..', 'config', 'database'));

/**
 * Enqueue a new job.
 *
 * @param {string} jobType  'SCROBBLE_COLLECT' | 'PIPELINE_VALIDATE'
 * @param {object} options
 *  - sessionId
 *  - discordId
 *  - payload (object -> JSONB)
 *  - runAfter (Date optional)
 *  - maxAttempts (number optional, default 3)
 */
async function enqueueJob(jobType, {
  sessionId = null,
  discordId = null,
  payload = {},
  runAfter = null,
  maxAttempts = 3
} = {}) {
  const query = `
    INSERT INTO lfm_job_queue (
      job_type,
      session_id,
      discord_id,
      payload,
      run_after,
      max_attempts
    )
    VALUES ($1, $2, $3, $4, COALESCE($5, NOW()), $6)
    RETURNING id, job_type, status, session_id, discord_id, run_after, attempts, max_attempts, created_at;
  `;

  const values = [
    jobType,
    sessionId,
    discordId,
    payload,
    runAfter ? runAfter.toISOString() : null,
    maxAttempts
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Fetch and lock the next job of a given type (FOR UPDATE SKIP LOCKED pattern).
 */
async function fetchAndLockNextJob(jobType) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const selectQuery = `
      SELECT id
      FROM lfm_job_queue
      WHERE status = 'PENDING'
        AND job_type = $1
        AND run_after <= NOW()
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1;
    `;
    const selectRes = await client.query(selectQuery, [jobType]);

    if (selectRes.rowCount === 0) {
      await client.query('COMMIT');
      return null;
    }

    const jobId = selectRes.rows[0].id;

    const updateQuery = `
      UPDATE lfm_job_queue
      SET status = 'RUNNING',
          attempts = attempts + 1,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    const updateRes = await client.query(updateQuery, [jobId]);

    await client.query('COMMIT');
    return updateRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Mark job as done.
 */
async function markJobDone(jobId) {
  const query = `
    UPDATE lfm_job_queue
    SET status = 'DONE',
        updated_at = NOW()
    WHERE id = $1;
  `;
  await pool.query(query, [jobId]);
}

/**
 * Mark job as failed.
 * If attempts < max_attempts, it will go back to PENDING with a small delay.
 */
async function markJobFailed(job) {
  const { id, attempts, max_attempts } = job;

  if (attempts >= max_attempts) {
    const query = `
      UPDATE lfm_job_queue
      SET status = 'FAILED',
          updated_at = NOW()
      WHERE id = $1;
    `;
    await pool.query(query, [id]);
    return;
  }

  // Re-schedule in 30 seconds
  const query = `
    UPDATE lfm_job_queue
    SET status = 'PENDING',
        run_after = NOW() + INTERVAL '30 seconds',
        updated_at = NOW()
    WHERE id = $1;
  `;
  await pool.query(query, [id]);
}

/**
 * Small helper to sleep in workers.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  enqueueJob,
  fetchAndLockNextJob,
  markJobDone,
  markJobFailed,
  sleep
};
