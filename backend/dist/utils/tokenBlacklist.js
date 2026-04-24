"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlacklistStats = exports.removeTokenFromBlacklist = exports.isTokenBlacklisted = exports.blacklistToken = void 0;
const redis_1 = require("../config/redis");
// ✅ SECURITY: Store blacklisted tokens in Redis with expiration matching JWT lifetime
// This prevents token reuse after logout
/**
 * Add token to blacklist
 * Token will automatically expire from Redis after JWT_EXPIRES_IN time
 */
const blacklistToken = async (token, expirationTime) => {
    try {
        const redis = (0, redis_1.getRedis)();
        const key = `blacklist:${token}`;
        // Set with EX (expire in seconds)
        await redis.setex(key, Math.ceil(expirationTime / 1000), "true");
        console.log(`[SECURITY] Token blacklisted: ${token.substring(0, 20)}...`);
    }
    catch (error) {
        console.error("[ERROR] Failed to blacklist token:", error);
        // Don't throw - logout should succeed even if blacklist fails
    }
};
exports.blacklistToken = blacklistToken;
/**
 * Check if token is blacklisted
 */
const isTokenBlacklisted = async (token) => {
    try {
        const redis = (0, redis_1.getRedis)();
        const key = `blacklist:${token}`;
        const result = await redis.exists(key);
        return result === 1;
    }
    catch (error) {
        console.error("[ERROR] Failed to check token blacklist:", error);
        // On Redis error, don't block authentication
        return false;
    }
};
exports.isTokenBlacklisted = isTokenBlacklisted;
/**
 * Remove token from blacklist (optional - for testing)
 */
const removeTokenFromBlacklist = async (token) => {
    try {
        const redis = (0, redis_1.getRedis)();
        const key = `blacklist:${token}`;
        await redis.del(key);
    }
    catch (error) {
        console.error("[ERROR] Failed to remove token from blacklist:", error);
    }
};
exports.removeTokenFromBlacklist = removeTokenFromBlacklist;
/**
 * Get blacklist stats (for monitoring)
 */
const getBlacklistStats = async () => {
    try {
        const redis = (0, redis_1.getRedis)();
        const keys = await redis.keys("blacklist:*");
        return { totalBlacklisted: keys.length };
    }
    catch (error) {
        console.error("[ERROR] Failed to get blacklist stats:", error);
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
