/**
 * File: logger.js
 * Description: Configures Winston for application logging, including console and file transports.
 * Author: João Aranha
 * Last Modified: 2025-09-22
 * Version: 1.2.0
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each log level in the console
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Common log format for files
const fileLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Corrected console transport configuration
const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(), // Apply colors
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
        winston.format.printf(
            // Correctly destructure to handle colorized output
            ({ timestamp, level, message, stack }) => {
                const logMsg = `${timestamp} ${level}: ${message}`;
                return stack ? `${logMsg}\n${stack}` : logMsg;
            }
        )
    ),
    level: 'debug'
});

// Configure the file transport for daily rotation
const fileTransport = new DailyRotateFile({
    filename: path.join(__dirname, '..', '..', 'logs', 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: fileLogFormat, // Use the common JSON format for files
    level: 'debug'
});

// Create the logger instance
const logger = winston.createLogger({
    levels,
    transports: [
        consoleTransport, // Log to console
        fileTransport,    // Log to file
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: path.join(__dirname, '..', '..', 'logs', 'exceptions.log') })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: path.join(__dirname, '..', '..', 'logs', 'rejections.log') })
    ]
});

module.exports = logger;