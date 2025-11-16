/**
 * File: src/routes/authDiscord.js
 * Description: Express routes for Discord OAuth login for NAS-LFM.
 * Author: João Aranha
 * Last-Modified: 2025-11-15
 * Version: v1.0.0
 */

'use strict';

const express = require('express');
const axios = require('axios');

const logger = require('../config/logger');
const db = require('../config/database');

const {
  buildDiscordOAuthUrl,
  generateState,
  storeState,
  validateState,
  setDiscordSession
} = require('../middleware/authDiscord');

const router = express.Router();

/**
 * GET /lfm/auth/discord/login (mounted as /lfm + this route)
 * Starts the Discord OAuth flow by redirecting the user to Discord.
 */
router.get('/auth/discord/login', async (req, res) => {
  try {
    const state = generateState();
    storeState(req, state);

    const authorizationUrl = buildDiscordOAuthUrl(state);
    return res.redirect(authorizationUrl);
  } catch (err) {
    logger.error('Failed to start Discord OAuth login', { error: err.message });

    return res.status(500).json({
      success: false,
      error: 'DISCORD_OAUTH_NOT_CONFIGURED',
      message: 'Discord OAuth is not configured on the server.'
    });
  }
});

/**
 * GET /lfm/auth/discord/callback
 * Handles the OAuth2 callback from Discord, resolves the user identity and
 * creates/updates the record in user_identity.
 */
router.get('/auth/discord/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_OAUTH_CALLBACK',
      message: 'Missing code or state in Discord OAuth callback.'
    });
  }

  if (!validateState(req, state)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_OAUTH_STATE',
      message: 'Discord OAuth state did not match the expected value.'
    });
  }

  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      logger.error('Discord OAuth environment variables missing for callback.');

      return res.status(500).json({
        success: false,
        error: 'DISCORD_OAUTH_NOT_CONFIGURED',
        message: 'Discord OAuth is not configured on the server.'
      });
    }

    // Exchange authorization code for access token.
    const tokenBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    }).toString();

    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      tokenBody,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data && tokenResponse.data.access_token;

    if (!accessToken) {
      logger.error('Discord OAuth: no access token received from token endpoint.');

      return res.status(502).json({
        success: false,
        error: 'DISCORD_OAUTH_TOKEN_ERROR',
        message: 'Failed to obtain Discord access token.'
      });
    }

    // Fetch user identity from Discord.
    const meResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const me = meResponse.data || {};
    const discordId = me.id;
    const discordUsername = me.username && me.discriminator
      ? `${me.username}#${me.discriminator}`
      : (me.username || 'unknown');

    if (!discordId) {
      logger.error('Discord OAuth: missing id on /users/@me response', { me });

      return res.status(502).json({
        success: false,
        error: 'DISCORD_OAUTH_PROFILE_ERROR',
        message: 'Failed to resolve Discord user profile.'
      });
    }

    // Ensure a record exists in user_identity for this Discord user.
    const result = await db.query(
      `
        INSERT INTO user_identity (discord_id, created_at, last_seen_at)
        VALUES ($1, now(), now())
        ON CONFLICT (discord_id) DO UPDATE
        SET last_seen_at = EXCLUDED.last_seen_at
        RETURNING discord_id, tier, is_mod, is_admin;
      `,
      [discordId]
    );

    const row = result.rows && result.rows[0]
      ? result.rows[0]
      : {
          discord_id: discordId,
          tier: 1,
          is_mod: false,
          is_admin: false
        };

    // Store identity in the session.
    setDiscordSession(req, {
      discordId: discordId,
      discordUsername: discordUsername,
      tier: row.tier,
      isAdmin: row.is_admin,
      isMod: row.is_mod
    });

    // Redirect to NAS-LFM frontend after successful login.
    const redirectTarget = process.env.LFM_FRONTEND_BASE_URL || '/';

    return res.redirect(redirectTarget);
  } catch (err) {
    logger.error('Discord OAuth callback failed', { error: err.message });

    return res.status(500).json({
      success: false,
      error: 'DISCORD_OAUTH_CALLBACK_FAILED',
      message: 'Failed to complete Discord login.'
    });
  }
});

/**
 * GET /lfm/auth/discord/whoami
 * Returns the current Discord identity from the session.
 */
router.get('/auth/discord/whoami', (req, res) => {
  if (!req.session || !req.session.discordIdentity || !req.session.discordIdentity.discordId) {
    return res.status(401).json({
      success: false,
      error: 'DISCORD_AUTH_REQUIRED',
      message: 'No active Discord session.'
    });
  }

  const identity = req.session.discordIdentity;

  return res.json({
    success: true,
    discordId: identity.discordId,
    discordUsername: identity.discordUsername,
    tier: identity.tier,
    isAdmin: identity.isAdmin,
    isMod: identity.isMod
  });
});

/**
 * POST /lfm/auth/discord/logout
 * Destroys the current session.
 */
router.post('/auth/discord/logout', (req, res) => {
  if (!req.session) {
    return res.status(200).json({
      success: true,
      message: 'No active session.'
    });
  }

  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'SESSION_DESTROY_FAILED',
        message: 'Failed to destroy session.'
      });
    }

    return res.json({
      success: true,
      message: 'Session destroyed.'
    });
  });
});

module.exports = router;
