import { config } from "./index";
import logger from "../utils/logger";

// ✅ SECURITY: Redis for token blacklist, CSRF tokens, and session management
// Type definition for Redis-like client
interface RedisClient {
  setex: (key: string, seconds: number, value: string) => Promise<void>;
  get: (key: string) => Promise<string | null>;
  exists: (key: string) => Promise<number>;
  del: (key: string) => Promise<void>;
  keys: (pattern: string) => Promise<string[]>;
  ping?: () => Promise<string>;
  on?: (event: string, callback: (err: any) => void) => void;
}

let redis: RedisClient | null = null;

export const initializeRedis = async (): Promise<void> => {
  // Check if Redis is configured
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT;

  // If no Redis is configured, use in-memory storage
  if (!redisUrl && !redisHost && !redisPort) {
    logger.info(
      "[REDIS] No Redis configured - using in-memory storage for development",
    );
    redis = createInMemoryRedis();
    return;
  }

  // Try to import and connect to Redis
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const redisPackage = require("redis");
    const createClient = redisPackage.createClient;
    let client;

    if (redisUrl) {
      // Production: Use Redis URL (e.g., from Heroku, Azure)
      client = createClient({ url: redisUrl });
    } else {
      // Development with Redis: Use host:port
      const host = redisHost || "localhost";
      const port = parseInt(redisPort || "6379");
      const password = process.env.REDIS_PASSWORD;

      client = createClient({
        host,
        port,
        ...(password && { password }),
      });
    }

    // Handle Redis errors
    client.on?.("error", (err: any) => {
      logger.error(
        `[REDIS ERROR] ${err instanceof Error ? err.message : String(err)}`,
      );
      // Fallback to in-memory if Redis connection fails
      if (!redis) {
        redis = createInMemoryRedis();
      }
    });

    client.on?.("connect", () => {
      logger.info("[REDIS] Connected successfully");
    });

    // Verify connection
    await client.ping?.();
    logger.info("[REDIS] Ping successful - connection verified");

    redis = client;
  } catch (error) {
    // Redis package not installed or connection failed - use fallback
    logger.warn(
      "[REDIS WARNING] Redis not available - using in-memory storage (not persistent)",
    );
    logger.warn(
      "[REDIS WARNING] For production: npm install redis and set REDIS_URL env var",
    );
    redis = createInMemoryRedis();
  }
};

/**
 * Fallback in-memory Redis implementation
 * Used when actual Redis is not available
 * NOT suitable for production - data is lost on restart
 */
function createInMemoryRedis(): RedisClient {
  const store = new Map<string, { value: string; expireAt: number }>();

  return {
    setex: async (key: string, seconds: number, value: string) => {
      const expireAt = Date.now() + seconds * 1000;
      store.set(key, { value, expireAt });
      // Auto-cleanup when expired
      setTimeout(() => {
        store.delete(key);
      }, seconds * 1000);
    },

    get: async (key: string) => {
      const item = store.get(key);
      if (!item) return null;
      if (item.expireAt < Date.now()) {
        store.delete(key);
        return null;
      }
      return item.value;
    },

    exists: async (key: string) => {
      const item = store.get(key);
      if (!item) return 0;
      if (item.expireAt < Date.now()) {
        store.delete(key);
        return 0;
      }
      return 1;
    },

    del: async (key: string) => {
      store.delete(key);
    },

    keys: async (pattern: string) => {
      const regex = new RegExp(pattern.replace("*", ".*"));
      return Array.from(store.keys()).filter((key) => regex.test(key));
    },

    ping: async () => "PONG",

    on: () => {},
  };
}

export const getRedis = (): RedisClient => {
  if (!redis) {
    throw new Error(
      "Redis not initialized. Call initializeRedis() first in server startup.",
    );
  }
  return redis;
};

export default redis;
