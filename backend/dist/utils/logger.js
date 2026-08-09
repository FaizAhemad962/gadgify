"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const isServerless = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';
const transports = [];
if (!isServerless) {
    // Local/server deployments can write log files. Vercel functions cannot write
    // to the bundled app directory, so they must log to stdout/stderr instead.
    const logsDir = path_1.default.join(__dirname, '../../logs');
    if (!fs_1.default.existsSync(logsDir)) {
        fs_1.default.mkdirSync(logsDir, { recursive: true });
    }
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5,
    }), new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 5,
    }), new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'security.log'),
        level: 'warn',
        maxsize: 5242880,
        maxFiles: 5,
    }));
}
if (isServerless || !isProduction) {
    transports.push(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(isProduction ? winston_1.default.format.uncolorize() : winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
const logger = winston_1.default.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    transports,
});
exports.default = logger;
