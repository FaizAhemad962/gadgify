"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// backend/src/config/logger.ts
const index_1 = require("./index");
class Logger {
    constructor() {
        this.isDev = index_1.config.nodeEnv === "development";
    }
    log(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}]`;
        if (level === "ERROR") {
            console.error(prefix, message, ...args);
        }
        else if (level === "WARN") {
            console.warn(prefix, message, ...args);
        }
        else if (level === "DEBUG" && this.isDev) {
            console.log(prefix, message, ...args);
        }
        else if (level !== "DEBUG") {
            console.log(prefix, message, ...args);
        }
    }
    error(message, ...args) {
        this.log("ERROR", message, ...args);
    }
    warn(message, ...args) {
        this.log("WARN", message, ...args);
    }
    info(message, ...args) {
        this.log("INFO", message, ...args);
    }
    debug(message, ...args) {
        this.log("DEBUG", message, ...args);
    }
}
exports.logger = new Logger();
