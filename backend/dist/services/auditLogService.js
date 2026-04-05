"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class AuditLogService {
    /**
     * Log an action for audit trail
     */
    async logAction(data) {
        try {
            await database_1.default.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    description: data.description,
                    email: data.email,
                    oldValue: data.oldValue,
                    newValue: data.newValue,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    status: data.status || "SUCCESS",
                },
            });
        }
        catch (error) {
            console.error("Failed to log audit action:", error);
            // Don't throw - audit logging should not block main operations
        }
    }
    /**
     * Get all audit logs for a user
     */
    async getUserAuditLogs(userId, limit = 50, offset = 0) {
        return await database_1.default.auditLog.findMany({
            where: { userId },
            orderBy: { timestamp: "desc" },
            take: limit,
            skip: offset,
            select: {
                id: true,
                action: true,
                description: true,
                email: true,
                oldValue: true,
                newValue: true,
                ipAddress: true,
                userAgent: true,
                status: true,
                timestamp: true,
            },
        });
    }
    /**
     * Get audit logs for an email (all accounts)
     */
    async getEmailAuditLogs(email, limit = 100, offset = 0) {
        return await database_1.default.auditLog.findMany({
            where: { email },
            orderBy: { timestamp: "desc" },
            take: limit,
            skip: offset,
            select: {
                id: true,
                userId: true,
                action: true,
                description: true,
                email: true,
                oldValue: true,
                newValue: true,
                ipAddress: true,
                userAgent: true,
                status: true,
                timestamp: true,
            },
        });
    }
    /**
     * Get audit logs by action type
     */
    async getAuditLogsByAction(action, limit = 100, offset = 0) {
        return await database_1.default.auditLog.findMany({
            where: { action },
            orderBy: { timestamp: "desc" },
            take: limit,
            skip: offset,
            select: {
                id: true,
                userId: true,
                action: true,
                description: true,
                email: true,
                timestamp: true,
                status: true,
            },
        });
    }
    /**
     * Get audit logs for failed actions
     */
    async getFailedAuditLogs(limit = 50, offset = 0) {
        return await database_1.default.auditLog.findMany({
            where: { status: "FAILED" },
            orderBy: { timestamp: "desc" },
            take: limit,
            skip: offset,
            select: {
                id: true,
                userId: true,
                action: true,
                description: true,
                email: true,
                timestamp: true,
            },
        });
    }
    /**
     * Get dashboard summary
     */
    async getAuditDashboard() {
        const [totalLogs, loginCount, roleChanges, accountCreations, failedActions,] = await Promise.all([
            database_1.default.auditLog.count(),
            database_1.default.auditLog.count({ where: { action: "LOGIN" } }),
            database_1.default.auditLog.count({ where: { action: "ROLE_CHANGED" } }),
            database_1.default.auditLog.count({ where: { action: "ACCOUNT_CREATED" } }),
            database_1.default.auditLog.count({ where: { status: "FAILED" } }),
        ]);
        // Get recent activity
        const recentActivity = await database_1.default.auditLog.findMany({
            orderBy: { timestamp: "desc" },
            take: 10,
            select: {
                id: true,
                action: true,
                email: true,
                timestamp: true,
                status: true,
            },
        });
        return {
            totalLogs,
            loginCount,
            roleChanges,
            accountCreations,
            failedActions,
            recentActivity,
        };
    }
    /**
     * Clean old audit logs (older than 90 days)
     */
    async cleanOldLogs(daysOld = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await database_1.default.auditLog.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate,
                },
            },
        });
        return result.count;
    }
}
exports.default = new AuditLogService();
