"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlacklistStats = exports.removeTokenFromBlacklist = exports.isTokenBlacklisted = exports.blacklistToken = void 0;
const redis_1 = require("../config/redis");
const logger_1 = __importDefault(require("./logger"));
const blacklistToken = async (token, expirationTime) => {
    try {
        const redis = (0, redis_1.getRedis)();
        const key = `blacklist:${token}`;
        await redis.setex(key, Math.ceil(expirationTime / 1000), "true");
        logger_1.default.info("Token blacklisted successfully");
    }
    catch (error) {
        logger_1.default.error(`Failed to blacklist token: ${error instanceof Error ? error.message : String(error)}`);
        // Logout should still succeed if blacklist storage is unavailable.
    }
};
exports.blacklistToken = blacklistToken;
const isTokenBlacklisted = async (token) => {
    try {
        const redis = (0, redis_1.getRedis)();
        const key = `blacklist:${token}`;
        const result = await redis.exists(key);
        return result === 1;
    }
    catch (error) {
        logger_1.default.error(`Failed to check token blacklist: ${error instanceof Error ? error.message : String(error)}`);
        // Keep auth available if Redis is temporarily unavailable.
        return false;
    }
};
exports.isTokenBlacklisted = isTokenBlacklisted;
const removeTokenFromBlacklist = async (token) => {
    try {
        const redis = (0, redis_1.getRedis)();
        const key = `blacklist:${token}`;
        await redis.del(key);
    }
    catch (error) {
        logger_1.default.error(`Failed to remove token from blacklist: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.removeTokenFromBlacklist = removeTokenFromBlacklist;
const getBlacklistStats = async () => {
    try {
        const redis = (0, redis_1.getRedis)();
        const keys = await redis.keys("blacklist:*");
        return { totalBlacklisted: keys.length };
    }
    catch (error) {
        logger_1.default.error(`Failed to get blacklist stats: ${error instanceof Error ? error.message : String(error)}`);
        return { totalBlacklisted: 0 };
    }
};
exports.getBlacklistStats = getBlacklistStats;
exports.default = {
    blacklistToken: exports.blacklistToken,
    isTokenBlacklisted: exports.isTokenBlacklisted,
    removeTokenFromBlacklist: exports.removeTokenFromBlacklist,
    getBlacklistStats: exports.getBlacklistStats,
};
