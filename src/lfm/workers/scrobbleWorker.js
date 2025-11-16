// File: src/lfm/workers/scrobbleWorker.js
// Worker that processes SCROBBLE_COLLECT jobs (chama Last.fm e preenche lfm_scrobbles_raw).

'use strict';

const path = require('path');
require('dotenv').config();

const jobQueue = require('../jobQueue');
const lfmService = require('../lfmService');

const JOB_TYPE = 'SCROBBLE_COLLECT';

// Limite de chamadas: algo em torno de 1 req a cada 650ms (~1.5 req/s)
const LASTFM_MIN_INTERVAL_MS = 650;

async function processJob(job) {
  const payload = job.payload || {};
  const sessionId = job.session_id;
  const discordId = job.discord_id || payload.discordId;

  if (!sessionId || !discordId) {
    console.error('[SCROBBLE_WORKER] Missing sessionId or discordId in job payload:', job.id);
    return;
  }

  console.log(`[SCROBBLE_WORKER] Processing job ${job.id} for session ${sessionId}, discordId=${discordId}`);

  const result = await lfmService.collectScrobblesForSession(sessionId, discordId);

  console.log('[SCROBBLE_WORKER] Collected scrobbles:', result);

  // Após coletar scrobbles, enfileira automaticamente o pipeline de validação
  await jobQueue.enqueueJob('PIPELINE_VALIDATE', {
    sessionId,
    discordId,
    payload: { reason: 'auto_after_scrobble_collect' }
  });
}

async function mainLoop() {
  console.log('[SCROBBLE_WORKER] Starting main loop for jobType =', JOB_TYPE);

  let lastCallTime = 0;

  while (true) {
    try {
      const job = await jobQueue.fetchAndLockNextJob(JOB_TYPE);

      if (!job) {
        // Nada na fila, dorme um pouco
        await jobQueue.sleep(1000);
        continue;
      }

      const now = Date.now();
      const diff = now - lastCallTime;

      if (diff < LASTFM_MIN_INTERVAL_MS) {
        await jobQueue.sleep(LASTFM_MIN_INTERVAL_MS - diff);
      }

      try {
        await processJob(job);
        await jobQueue.markJobDone(job.id);
      } catch (err) {
        console.error('[SCROBBLE_WORKER] Error processing job', job.id, err);
        await jobQueue.markJobFailed(job);
      }

      lastCallTime = Date.now();
    } catch (loopErr) {
      console.error('[SCROBBLE_WORKER] Fatal loop error:', loopErr);
      await jobQueue.sleep(5000);
    }
  }
}

if (require.main === module) {
  mainLoop().catch((err) => {
    console.error('[SCROBBLE_WORKER] Unhandled error:', err);
    process.exit(1);
  });
}

module.exports = {
  mainLoop
};
