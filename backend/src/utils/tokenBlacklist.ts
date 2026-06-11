import { getRedis } from "../config/redis";
import logger from "./logger";

export const blacklistToken = async (
  token: string,
  expirationTime: number,
): Promise<void> => {
  try {
    const redis = getRedis();
    const key = `blacklist:${token}`;
    await redis.setex(key, Math.ceil(expirationTime / 1000), "true");
    logger.info("Token blacklisted successfully");
  } catch (error) {
    logger.error(
      `Failed to blacklist token: ${error instanceof Error ? error.message : String(error)}`,
    );
    // Logout should still succeed if blacklist storage is unavailable.
  }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const redis = getRedis();
    const key = `blacklist:${token}`;
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    logger.error(
      `Failed to check token blacklist: ${error instanceof Error ? error.message : String(error)}`,
    );
    // Keep auth available if Redis is temporarily unavailable.
    return false;
  }
};

export const removeTokenFromBlacklist = async (
  token: string,
): Promise<void> => {
  try {
    const redis = getRedis();
    const key = `blacklist:${token}`;
    await redis.del(key);
  } catch (error) {
    logger.error(
      `Failed to remove token from blacklist: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const getBlacklistStats = async (): Promise<{
  totalBlacklisted: number;
}> => {
  try {
    const redis = getRedis();
    const keys = await redis.keys("blacklist:*");
    return { totalBlacklisted: keys.length };
  } catch (error) {
    logger.error(
      `Failed to get blacklist stats: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { totalBlacklisted: 0 };
  }
};

export default {
  blacklistToken,
  isTokenBlacklisted,
  removeTokenFromBlacklist,
  getBlacklistStats,
};
