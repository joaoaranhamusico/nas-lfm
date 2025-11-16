/**
 * File: database.js
 * Description: Manages PostgreSQL database connections using pg-pool.
 * Author: João Aranha
 * Last Modified: 2025-09-08 - Corrected environment variable names to match .env file (PG*).
 */

require('dotenv').config();

const { Pool } = require('pg');
const logger = require('./logger');

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

pool.on('connect', client => {
    logger.info('PostgreSQL client connected from pool.');
});

pool.on('error', (err, client) => {
    logger.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = {
    query: (text, params) => {
        logger.debug('Executing DB query:', { text, params });
        return pool.query(text, params);
    },
    pool: pool,
};