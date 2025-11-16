// File: src/lfm/workers/pipelineWorker.js
// Worker that processes PIPELINE_VALIDATE jobs.

'use strict';

const path = require('path');
require('dotenv').config();

const jobQueue = require('../jobQueue');
const { runPipelineForSession } = require('../pipeline/playPipeline');

const JOB_TYPE = 'PIPELINE_VALIDATE';

async function processJob(job) {
  const sessionId = job.session_id;
  if (!sessionId) {
    console.error('[PIPELINE_WORKER] Missing sessionId in job payload:', job.id);
    return;
  }

  console.log('[PIPELINE_WORKER] Processing session', sessionId, 'for job', job.id);
  const summary = await runPipelineForSession(sessionId);
  console.log('[PIPELINE_WORKER] Pipeline summary:', summary);
}

async function mainLoop() {
  console.log('[PIPELINE_WORKER] Starting main loop for jobType =', JOB_TYPE);

  while (true) {
    try {
      const job = await jobQueue.fetchAndLockNextJob(JOB_TYPE);

      if (!job) {
        await jobQueue.sleep(1000);
        continue;
      }

      try {
        await processJob(job);
        await jobQueue.markJobDone(job.id);
      } catch (err) {
        console.error('[PIPELINE_WORKER] Error processing job', job.id, err);
        await jobQueue.markJobFailed(job);
      }
    } catch (loopErr) {
      console.error('[PIPELINE_WORKER] Fatal loop error:', loopErr);
      await jobQueue.sleep(5000);
    }
  }
}

if (require.main === module) {
  mainLoop().catch((err) => {
    console.error('[PIPELINE_WORKER] Unhandled error:', err);
    process.exit(1);
  });
}

module.exports = {
  mainLoop
};
