/**
 * File: lfmServer.js
 * Description: Standalone Express server for NAS Utilities 2.0 - Last.fm sidecar (port 3001).
 * Author: João Aranha
 * Last-Modified: 2025-11-13
 * Version: v1.2.0
 */

'use strict';

const express = require('express');
const path = require('path');

// Load environment variables if dotenv is used in the project.
require('dotenv').config();

const app = express();

// Middlewares for JSON and URL-encoded bodies.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Last.fm controller (sidecar module)
const lfmController = require(path.join(__dirname, 'src', 'lfm', 'lfmController'));

/**
 * Routes for Last.fm sidecar.
 * All endpoints are strictly under /lfm/* to keep isolation from the main Spotify app.
 */
app.get('/lfm', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Last.fm sidecar is running. Use /lfm/health, /lfm/connect, /lfm/status, /lfm/session/start or /lfm/session/collect-scrobbles.'
  });
});

app.get('/lfm/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Last.fm sidecar is running.'
  });
});

app.get('/lfm/connect', lfmController.connectLastfm);
app.get('/lfm/callback', lfmController.lastfmCallback);
app.get('/lfm/status', lfmController.lastfmStatus);
app.post('/lfm/session/start', lfmController.startSession);
app.post('/lfm/session/collect-scrobbles', lfmController.collectScrobbles);

// Port configuration (default 3001)
const PORT = process.env.LFM_PORT || 3001;

// Start server only if this file is executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`NAS Utilities Last.fm sidecar listening on port ${PORT}`);
  });
}

module.exports = app;
