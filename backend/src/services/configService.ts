// backend/src/services/configService.ts
import prisma from "../config/database";
import { logger } from "../config/logger";

interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
}

export class ConfigService {
  private static cache: Map<string, CacheEntry> = new Map();
  private static readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get configuration value from database
   * Returns default value if not found
   * Implements caching to avoid database hits
   */
  static async getConfig<T = any>(key: string, defaultValue?: T): Promise<T> {
    try {
      // Check cache first
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.value;
      }

      // Get from database
      const config = await prisma.businessConfiguration.findUnique({
        where: { key },
      });

      if (!config) {
        return defaultValue as T;
      }

      // Parse based on data type
      let value: any;
      switch (config.dataType) {
        case "number":
          value = parseFloat(config.value);
          break;
        case "boolean":
          value = config.value === "true";
          break;
        case "json":
          value = JSON.parse(config.value);
          break;
        default:
          value = config.value;
      }

      // Cache the value
      this.cache.set(key, {
        value,
        timestamp: Date.now(),
        ttl: this.DEFAULT_CACHE_TTL,
      });

      return value;
    } catch (error) {
      logger.error(`Error getting config ${key}:`, error);
      return defaultValue as T;
    }
  }

  /**
   * Get multiple config values at once
   */
  static async getMultiple(keys: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    for (const key of keys) {
      result[key] = await this.getConfig(key);
    }

    return result;
  }

  /**
   * Get all active configurations
   */
  static async getAllActive(): Promise<Record<string, any>> {
    try {
      const configs = await prisma.businessConfiguration.findMany({
        where: { isActive: true },
      });

      const result: Record<string, any> = {};

      for (const config of configs) {
        let value: any;
        switch (config.dataType) {
          case "number":
            value = parseFloat(config.value);
            break;
          case "boolean":
            value = config.value === "true";
            break;
          case "json":
            value = JSON.parse(config.value);
            break;
          default:
            value = config.value;
        }
        result[config.key] = value;
      }

      return result;
    } catch (error) {
      logger.error("Error getting all configs:", error);
      return {};
    }
  }

  /**
   * Update configuration (SUPER_ADMIN only)
   */
  static async updateConfig(
    key: string,
    value: any,
    dataType: string = "string",
    userId?: string,
  ): Promise<any> {
    try {
      const result = await prisma.businessConfiguration.upsert({
        where: { key },
        create: {
          key,
          value: String(value),
          dataType,
          createdBy: userId,
          isActive: true,
        },
        update: {
          value: String(value),
          dataType,
          updatedAt: new Date(),
          createdBy: userId,
        },
      });

      // Invalidate cache
      this.cache.delete(key);

      logger.info(`Config updated: ${key} = ${value}`);
      return result;
    } catch (error) {
      logger.error(`Error updating config ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if feature flag is enabled
   */
  static async isFeatureEnabled(
    featureName: string,
    userRole?: string,
    userId?: string,
  ): Promise<boolean> {
    try {
      // Check cache first
      const cacheKey = `feature_${featureName}_${userRole}_${userId}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.value;
      }

      // Get from database
      const flag = await prisma.featureFlag.findUnique({
        where: { name: featureName },
      });

      if (!flag || !flag.isEnabled) {
        return false;
      }

      // Check role restriction
      if (userRole && flag.targetRolesJson) {
        try {
          const allowedRoles = JSON.parse(flag.targetRolesJson);
          if (!allowedRoles.includes(userRole)) {
            return false;
          }
        } catch (e) {
          logger.warn(`Invalid targetRolesJson for flag ${featureName}`);
        }
      }

      // Check user restriction
      if (userId && flag.targetUsersJson) {
        try {
          const allowedUsers = JSON.parse(flag.targetUsersJson);
          if (!allowedUsers.includes(userId)) {
            return false;
          }
        } catch (e) {
          logger.warn(`Invalid targetUsersJson for flag ${featureName}`);
        }
      }

      // Check percentage rollout
      if (flag.percentage < 100) {
        const hash = (userId || "unknown")
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const isIncluded = hash % 100 < flag.percentage;
        if (!isIncluded) {
          return false;
        }
      }

      // Cache the result
      this.cache.set(cacheKey, {
        value: true,
        timestamp: Date.now(),
        ttl: 60 * 1000, // 1 minute for feature flags
      });

      return true;
    } catch (error) {
      logger.error(`Error checking feature flag ${featureName}:`, error);
      return false;
    }
  }

  /**
   * Clear specific cache entry
   */
  static clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export default ConfigService;
