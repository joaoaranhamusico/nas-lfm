/**
 * Description: Utility functions for encrypting and decrypting data using Node.js crypto.
 * Author: João Aranha
 * Creation Date: 2025-09-25T15:07:00Z
 * Version: 1.0.0
 */

const crypto = require('crypto');

// Ensure the encryption key is set in the environment variables
const encryptionKey = process.env.ENCRYPTION_SECRET_KEY;
if (!encryptionKey || encryptionKey.length !== 32) {
    throw new Error('ENCRYPTION_SECRET_KEY is not defined or is not 32 characters long.');
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a plaintext token.
 * @param {string} token - The plaintext token to encrypt.
 * @returns {string} The encrypted token, formatted as iv:authtag:encrypted.
 */
function encryptToken(token) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(encryptionKey), iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted token.
 * @param {string} encryptedToken - The encrypted token string (iv:authtag:encrypted).
 * @returns {string} The decrypted plaintext token.
 */
function decryptToken(encryptedToken) {
    try {
        const parts = encryptedToken.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted token format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encryptedText = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(encryptionKey), iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error);
        // Return null or throw a more specific error for the caller to handle
        return null; 
    }
}

module.exports = {
    encryptToken,
    decryptToken,
};