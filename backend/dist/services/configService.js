"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
// backend/src/services/configService.ts
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../config/logger");
class ConfigService {
    /**
     * Get configuration value from database
     * Returns default value if not found
     * Implements caching to avoid database hits
     */
    static async getConfig(key, defaultValue) {
        try {
            // Check cache first
            const cached = this.cache.get(key);
            if (cached && Date.now() - cached.timestamp < cached.ttl) {
                return cached.value;
            }
            // Get from database
            const config = await database_1.default.businessConfiguration.findUnique({
                where: { key },
            });
            if (!config) {
                return defaultValue;
            }
            // Parse based on data type
            let value;
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
        }
        catch (error) {
            logger_1.logger.error(`Error getting config ${key}:`, error);
            return defaultValue;
        }
    }
    /**
     * Get multiple config values at once
     */
    static async getMultiple(keys) {
        const result = {};
        for (const key of keys) {
            result[key] = await this.getConfig(key);
        }
        return result;
    }
    /**
     * Get all active configurations
     */
    static async getAllActive() {
        try {
            const configs = await database_1.default.businessConfiguration.findMany({
                where: { isActive: true },
            });
            const result = {};
            for (const config of configs) {
                let value;
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
        }
        catch (error) {
            logger_1.logger.error("Error getting all configs:", error);
            return {};
        }
    }
    /**
     * Update configuration (SUPER_ADMIN only)
     */
    static async updateConfig(key, value, dataType = "string", userId) {
        try {
            const result = await database_1.default.businessConfiguration.upsert({
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
            logger_1.logger.info(`Config updated: ${key} = ${value}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error(`Error updating config ${key}:`, error);
            throw error;
        }
    }
    /**
     * Check if feature flag is enabled
     */
    static async isFeatureEnabled(featureName, userRole, userId) {
        try {
            // Check cache first
            const cacheKey = `feature_${featureName}_${userRole}_${userId}`;
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < cached.ttl) {
                return cached.value;
            }
            // Get from database
            const flag = await database_1.default.featureFlag.findUnique({
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
                }
                catch (e) {
                    logger_1.logger.warn(`Invalid targetRolesJson for flag ${featureName}`);
                }
            }
            // Check user restriction
            if (userId && flag.targetUsersJson) {
                try {
                    const allowedUsers = JSON.parse(flag.targetUsersJson);
                    if (!allowedUsers.includes(userId)) {
                        return false;
                    }
                }
                catch (e) {
                    logger_1.logger.warn(`Invalid targetUsersJson for flag ${featureName}`);
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
        }
        catch (error) {
            logger_1.logger.error(`Error checking feature flag ${featureName}:`, error);
            return false;
        }
    }
    /**
     * Clear specific cache entry
     */
    static clearCache(key) {
        if (key) {
            this.cache.delete(key);
        }
        else {
            this.cache.clear();
        }
    }
}
exports.ConfigService = ConfigService;
ConfigService.cache = new Map();
ConfigService.DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
exports.default = ConfigService;
