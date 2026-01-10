"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconnectDatabase = exports.checkConnectionHealth = exports.closeConnectionPool = exports.initializeConnectionPool = void 0;
const database_1 = __importDefault(require("../config/database"));
/**
 * Manages database connection pooling
 * Ensures proper connection lifecycle and prevents pool exhaustion
 */
const initializeConnectionPool = async () => {
    try {
        // Test connection
        await database_1.default.$queryRaw `SELECT 1`;
        console.log('✓ Database connection pool initialized successfully');
    }
    catch (error) {
        console.error('✗ Failed to initialize connection pool:', error);
        throw error;
    }
};
exports.initializeConnectionPool = initializeConnectionPool;
/**
 * Gracefully close database connections
 */
const closeConnectionPool = async () => {
    try {
        await database_1.default.$disconnect();
        console.log('✓ Database connections closed gracefully');
    }
    catch (error) {
        console.error('✗ Error closing database connections:', error);
    }
};
exports.closeConnectionPool = closeConnectionPool;
/**
 * Health check for database connection
 */
const checkConnectionHealth = async () => {
    try {
        await database_1.default.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error('Connection health check failed:', error);
        return false;
    }
};
exports.checkConnectionHealth = checkConnectionHealth;
/**
 * Reconnect if connection is lost
 */
const reconnectDatabase = async (maxRetries = 3) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const isHealthy = await (0, exports.checkConnectionHealth)();
            if (isHealthy) {
                console.log('✓ Database reconnected successfully');
                return true;
            }
        }
        catch (error) {
            retries++;
            console.warn(`Reconnection attempt ${retries}/${maxRetries} failed:`, error);
            if (retries < maxRetries) {
                // Wait before retrying (exponential backoff)
                await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
            }
        }
    }
    console.error('✗ Failed to reconnect after maximum retries');
    return false;
};
exports.reconnectDatabase = reconnectDatabase;
