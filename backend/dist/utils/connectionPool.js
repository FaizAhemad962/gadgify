"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconnectDatabase = exports.checkConnectionHealth = exports.closeConnectionPool = exports.initializeConnectionPool = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("./logger"));
const initializeConnectionPool = async () => {
    try {
        await database_1.default.$queryRaw `SELECT 1`;
        logger_1.default.info("Database connection pool initialized successfully");
    }
    catch (error) {
        logger_1.default.error(`Failed to initialize connection pool: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
};
exports.initializeConnectionPool = initializeConnectionPool;
const closeConnectionPool = async () => {
    try {
        await database_1.default.$disconnect();
        logger_1.default.info("Database connections closed gracefully");
    }
    catch (error) {
        logger_1.default.error(`Error closing database connections: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.closeConnectionPool = closeConnectionPool;
const checkConnectionHealth = async () => {
    try {
        await database_1.default.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        logger_1.default.error(`Connection health check failed: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
};
exports.checkConnectionHealth = checkConnectionHealth;
const reconnectDatabase = async (maxRetries = 3) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const isHealthy = await (0, exports.checkConnectionHealth)();
            if (isHealthy) {
                logger_1.default.info("Database reconnected successfully");
                return true;
            }
        }
        catch (error) {
            retries++;
            logger_1.default.warn(`Reconnection attempt ${retries}/${maxRetries} failed: ${error instanceof Error ? error.message : String(error)}`);
            if (retries < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
            }
        }
    }
    logger_1.default.error("Failed to reconnect after maximum retries");
    return false;
};
exports.reconnectDatabase = reconnectDatabase;
