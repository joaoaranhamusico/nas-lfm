#!/bin/bash

# ==========================================
# NAS Utilities 2.0 - Last.fm Sidecar Deploy
# Author: João Aranha
# Last Modified: 2025-11-14
# Description:
# Deployment script for the NAS Last.fm sidecar (nas-lfm),
# running as a separate PM2 process on port 3001,
# plus the background workers for scrobble collection and pipeline.
# ==========================================

APP_NAME_SERVER="nas-lfm"
APP_NAME_SCROBBLES="nas-lfm-scrobbles"
APP_NAME_PIPELINE="nas-lfm-pipeline"

APP_DIR="/home/aranha/nas-app"
ENTRY_FILE_SERVER="lfmServer.js"
ENTRY_FILE_SCROBBLES="src/lfm/workers/scrobbleWorker.js"
ENTRY_FILE_PIPELINE="src/lfm/workers/pipelineWorker.js"

echo "----------------------------------------"
echo " NAS UTILITIES 2.0 - LAST.FM DEPLOY STARTED"
echo "----------------------------------------"

cd "$APP_DIR" || {
    echo "[ERROR] Could not enter app directory: $APP_DIR"
    exit 1
}

echo "[1/5] Installing production dependencies (shared with main app)..."
npm install --production

echo "[2/5] Checking PM2 process list..."
pm2 list

echo "[3/5] Starting or restarting Last.fm sidecar HTTP server..."

# Server / API (porta 3001)
if pm2 describe "$APP_NAME_SERVER" > /dev/null 2>&1; then
    echo "[INFO] Process '$APP_NAME_SERVER' found. Restarting with --update-env..."
    pm2 restart "$APP_NAME_SERVER" --update-env
else
    echo "[INFO] Process '$APP_NAME_SERVER' not found. Starting new PM2 process..."
    pm2 start "$ENTRY_FILE_SERVER" --name "$APP_NAME_SERVER"
fi

echo "[4/5] Starting or restarting Last.fm workers..."

# Worker 1: scrobble collector (chama Last.fm e preenche lfm_scrobbles_raw)
if pm2 describe "$APP_NAME_SCROBBLES" > /dev/null 2>&1; then
    echo "[INFO] Process '$APP_NAME_SCROBBLES' found. Restarting with --update-env..."
    pm2 restart "$APP_NAME_SCROBBLES" --update-env
else
    echo "[INFO] Process '$APP_NAME_SCROBBLES' not found. Starting new PM2 process..."
    pm2 start "$ENTRY_FILE_SCROBBLES" --name "$APP_NAME_SCROBBLES"
fi

# Worker 2: pipeline (preprocess, plays_unverified, validações, plays_verified)
if pm2 describe "$APP_NAME_PIPELINE" > /dev/null 2>&1; then
    echo "[INFO] Process '$APP_NAME_PIPELINE' found. Restarting with --update-env..."
    pm2 restart "$APP_NAME_PIPELINE" --update-env
else
    echo "[INFO] Process '$APP_NAME_PIPELINE' not found. Starting new PM2 process..."
    pm2 start "$ENTRY_FILE_PIPELINE" --name "$APP_NAME_PIPELINE"
fi

echo "[5/5] Saving PM2 state..."
pm2 save

echo "----------------------------------------"
echo " ✅ NAS Last.fm sidecar deployment completed successfully"
echo "----------------------------------------"

echo "--- Processes managed by PM2 ---"
echo "  - $APP_NAME_SERVER     (HTTP API - port 3001)"
echo "  - $APP_NAME_SCROBBLES  (Scrobble collector worker)"
echo "  - $APP_NAME_PIPELINE   (Pipeline/validation worker)"
echo
echo "--- To view logs in real-time, use: ---"
echo "  pm2 logs $APP_NAME_SERVER"
echo "  pm2 logs $APP_NAME_SCROBBLES"
echo "  pm2 logs $APP_NAME_PIPELINE"

exit 0
