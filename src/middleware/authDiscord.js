/**
 * File: src/middleware/authDiscord.js
 * Description: Helper functions and middleware for Discord OAuth session handling.
 * Author: João Aranha
 * Last-Modified: 2025-11-15
 * Version: v1.0.0
 */

'use strict';

const crypto = require('crypto');

const DEFAULT_SCOPES = process.env.DISCORD_OAUTH_SCOPES || 'identify';

/**
 * Builds the Discord OAuth2 authorization URL.
 * Throws if required environment variables are missing.
 */
function buildDiscordOAuthUrl(state) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('Discord OAuth not configured. Missing DISCORD_CLIENT_ID or DISCORD_REDIRECT_URI.');
  }

  const baseUrl = 'https://discord.com/oauth2/authorize';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: DEFAULT_SCOPES,
    state
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generates a random state token for CSRF protection.
 */
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Stores the OAuth state token in the current session (if available).
 */
function storeState(req, state) {
  if (!req.session) {
    return;
  }
  req.session.discordOAuthState = state;
}

/**
 * Validates and clears the stored OAuth state token from the session.
 */
function validateState(req, stateFromQuery) {
  if (!req.session) {
    return false;
  }

  const expected = req.session.discordOAuthState;
  delete req.session.discordOAuthState;

  if (!expected || !stateFromQuery) {
    return false;
  }

  return expected === stateFromQuery;
}

/**
 * Stores the resolved Discord identity into the session.
 */
function setDiscordSession(req, identity) {
  if (!req.session) {
    return;
  }

  req.session.discordIdentity = {
    discordId: identity.discordId,
    discordUsername: identity.discordUsername,
    tier: identity.tier,
    isAdmin: !!identity.isAdmin,
    isMod: !!identity.isMod
  };
}

/**
 * Middleware that requires the user to be authenticated via Discord.
 * Can be attached to protected routes in future patches.
 */
function requireDiscordAuth(req, res, next) {
  if (req.session && req.session.discordIdentity && req.session.discordIdentity.discordId) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'DISCORD_AUTH_REQUIRED',
    message: 'You must be logged in with Discord to access this resource.'
  });
}

module.exports = {
  buildDiscordOAuthUrl,
  generateState,
  storeState,
  validateState,
  setDiscordSession,
  requireDiscordAuth
};
