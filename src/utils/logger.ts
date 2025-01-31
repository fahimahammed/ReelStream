import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file';
import fs from 'fs';
import env from '../config/env';


const logDirectory = path.join(__dirname, '../../logs');

const logLevel = env.env === 'production' ? 'warn' : 'debug';


if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDirectory, 'api-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '7d',
    level: logLevel,
    zippedArchive: true,
});

const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(), // Colorize the log output
        winston.format.simple(), // Simple log format
        winston.format.timestamp(),
        winston.format.simple(),
    ),
    level: logLevel,
});

const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        consoleTransport,
        dailyRotateFileTransport,
    ],
});

// // Test the logger
// logger.info('Logger is working!');
// logger.error('This is an error log');
// logger.warn('This is a warning log');

export default logger;
