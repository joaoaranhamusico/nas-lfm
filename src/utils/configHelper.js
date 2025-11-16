/**
 * @description Helper to get application configuration from DB, specifically the current scoring period.
 * @author João Aranha
 * @creation-date 2025-10-27T14:30:00Z
 * @last-modified 2025-10-27T14:35:00Z
 * @version 1.0.0
 * /scr/Utils/configHelper.js
 */
const db = require('../config/database');
const logger = require('../config/logger');

// Function to get ISO year and week number from a Date object
// (Based on https://stackoverflow.com/a/6117889/ - adjusted for UTC)
function getISOWeekAndYear(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // sunday = 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week: weekNo };
}

/**
 * Gets the current scoring period (year and week number) from the app_config table.
 * Falls back to the current UTC week/year if DB query fails or key is missing/invalid.
 * @returns {Promise<{year: number, week: number}>}
 */
async function getCurrentScoringPeriod() {
    try {
        const result = await db.query("SELECT config_value FROM app_config WHERE config_key = 'current_scoring_period'");
        if (result.rows.length > 0 && result.rows[0].config_value) {
            const [yearStr, weekStr] = result.rows[0].config_value.split('-');
            const year = parseInt(yearStr, 10);
            const week = parseInt(weekStr, 10);
            // Basic validation: Check if year looks valid and week is between 1 and 53
            if (!isNaN(year) && year > 2020 && !isNaN(week) && week >= 1 && week <= 53) {
                // logger.debug(`[CONFIG] Using scoring period from DB: ${year}-${week}`);
                return { year, week };
            } else {
                 logger.warn(`[CONFIG] Invalid format for 'current_scoring_period' in DB: ${result.rows[0].config_value}. Falling back.`);
            }
        } else {
             logger.warn("[CONFIG] 'current_scoring_period' key not found in app_config. Falling back.");
        }
    } catch (err) {
        logger.error('[CONFIG] Failed to get current scoring period from DB:', err);
    }
    // Fallback to current date (calculated via ISO logic)
    logger.warn('[CONFIG] Falling back to current UTC date for scoring period.');
    return getISOWeekAndYear(new Date());
}

/**
 * Sets the current scoring period in the app_config table.
 * (To be used by the admin panel or manual update)
 * @param {number} year - The ISO year.
 * @param {number} week - The ISO week number.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
async function setCurrentScoringPeriod(year, week) {
    // Ensure week is zero-padded if needed (though IW format handles single digits)
    const value = `${year}-${String(week).padStart(2, '0')}`;
    try {
        await db.query(`
            INSERT INTO app_config (config_key, config_value, last_updated)
            VALUES ('current_scoring_period', $1, NOW())
            ON CONFLICT (config_key)
            DO UPDATE SET config_value = EXCLUDED.config_value, last_updated = NOW()
        `, [value]);
        logger.info(`[CONFIG] Scoring period manually set to: ${value}`);
        return true;
    } catch (err) {
        logger.error(`[CONFIG] Failed to set scoring period to ${value}:`, err);
        return false;
    }
}


module.exports = {
    getCurrentScoringPeriod,
    setCurrentScoringPeriod,
    getISOWeekAndYear // Export helper if needed elsewhere
};