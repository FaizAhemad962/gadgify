import { getRedis } from "../config/redis";

// ✅ SECURITY: Store blacklisted tokens in Redis with expiration matching JWT lifetime
// This prevents token reuse after logout

/**
 * Add token to blacklist
 * Token will automatically expire from Redis after JWT_EXPIRES_IN time
 */
export const blacklistToken = async (
  token: string,
  expirationTime: number,
): Promise<void> => {
  try {
    const redis = getRedis();
    const key = `blacklist:${token}`;
    // Set with EX (expire in seconds)
    await redis.setex(key, Math.ceil(expirationTime / 1000), "true");
    console.log(`[SECURITY] Token blacklisted: ${token.substring(0, 20)}...`);
  } catch (error) {
    console.error("[ERROR] Failed to blacklist token:", error);
    // Don't throw - logout should succeed even if blacklist fails
  }
};

/**
 * Check if token is blacklisted
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const redis = getRedis();
    const key = `blacklist:${token}`;
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error("[ERROR] Failed to check token blacklist:", error);
    // On Redis error, don't block authentication
    return false;
  }
};

/**
 * Remove token from blacklist (optional - for testing)
 */
export const removeTokenFromBlacklist = async (
  token: string,
): Promise<void> => {
  try {
    const redis = getRedis();
    const key = `blacklist:${token}`;
    await redis.del(key);
  } catch (error) {
    console.error("[ERROR] Failed to remove token from blacklist:", error);
  }
};

/**
 * Get blacklist stats (for monitoring)
 */
export const getBlacklistStats = async (): Promise<{
  totalBlacklisted: number;
}> => {
  try {
    const redis = getRedis();
    const keys = await redis.keys("blacklist:*");
    return { totalBlacklisted: keys.length };
  } catch (error) {
    console.error("[ERROR] Failed to get blacklist stats:", error);
    return { totalBlacklisted: 0 };
  }
};

export default {
  blacklistToken,
  isTokenBlacklisted,
  removeTokenFromBlacklist,
  getBlacklistStats,
};
