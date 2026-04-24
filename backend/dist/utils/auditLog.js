"use strict";
/**
 * ✅ SECURITY: Activity logging and audit trails
 * Logs all important actions for security monitoring and compliance
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentSecurityEvents = exports.getAuditLogsByAction = exports.getUserAuditLogs = exports.logSecurityEvent = exports.logAuditEvent = exports.getUserAgent = exports.getIpAddress = exports.AuditAction = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("./logger"));
var AuditAction;
(function (AuditAction) {
    // Authentication
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["SIGNUP"] = "SIGNUP";
    AuditAction["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    AuditAction["PASSWORD_RESET"] = "PASSWORD_RESET";
    AuditAction["EMAIL_VERIFIED"] = "EMAIL_VERIFIED";
    // User Management
    AuditAction["PROFILE_UPDATE"] = "PROFILE_UPDATE";
    AuditAction["PROFILE_PHOTO_UPDATE"] = "PROFILE_PHOTO_UPDATE";
    AuditAction["ROLE_CHANGE"] = "ROLE_CHANGE";
    // Product Management
    AuditAction["PRODUCT_CREATE"] = "PRODUCT_CREATE";
    AuditAction["PRODUCT_UPDATE"] = "PRODUCT_UPDATE";
    AuditAction["PRODUCT_DELETE"] = "PRODUCT_DELETE";
    AuditAction["PRODUCT_PUBLISH"] = "PRODUCT_PUBLISH";
    AuditAction["PRODUCT_UNPUBLISH"] = "PRODUCT_UNPUBLISH";
    // Order Management
    AuditAction["ORDER_CREATE"] = "ORDER_CREATE";
    AuditAction["ORDER_CANCEL"] = "ORDER_CANCEL";
    AuditAction["ORDER_REFUND"] = "ORDER_REFUND";
    AuditAction["ORDER_STATUS_CHANGE"] = "ORDER_STATUS_CHANGE";
    // Admin Actions
    AuditAction["ADMIN_USER_DELETE"] = "ADMIN_USER_DELETE";
    AuditAction["ADMIN_ROLE_GRANT"] = "ADMIN_ROLE_GRANT";
    AuditAction["ADMIN_ROLE_REVOKE"] = "ADMIN_ROLE_REVOKE";
    AuditAction["ADMIN_SETTINGS_UPDATE"] = "ADMIN_SETTINGS_UPDATE";
    // Security Events
    AuditAction["FAILED_LOGIN"] = "FAILED_LOGIN";
    AuditAction["ACCOUNT_LOCKED"] = "ACCOUNT_LOCKED";
    AuditAction["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    AuditAction["UNAUTHORIZED_ACCESS_ATTEMPT"] = "UNAUTHORIZED_ACCESS_ATTEMPT";
    // File Operations
    AuditAction["FILE_UPLOAD"] = "FILE_UPLOAD";
    AuditAction["FILE_DELETE"] = "FILE_DELETE";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
/**
 * Extract IP address from request
 */
const getIpAddress = (req) => {
    if (!req)
        return undefined;
    // Check for IP in headers (proxies)
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        return typeof forwarded === "string"
            ? forwarded.split(",")[0].trim()
            : forwarded[0];
    }
    return req.socket?.remoteAddress || req.ip;
};
exports.getIpAddress = getIpAddress;
/**
 * Get user agent from request
 */
const getUserAgent = (req) => {
    if (!req)
        return undefined;
    return req.headers["user-agent"];
};
exports.getUserAgent = getUserAgent;
/**
 * Log audit event
 */
const logAuditEvent = async (data) => {
    try {
        await database_1.default.auditLog.create({
            data: {
                userId: data.userId,
                email: data.email,
                action: data.action,
                description: data.description,
                oldValue: data.oldValue,
                newValue: data.newValue,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                status: data.status || "SUCCESS",
            },
        });
        logger_1.default.debug(`[AUDIT] ${data.action} | User: ${data.email} | ${data.description || ""}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to log audit event: ${error instanceof Error ? error.message : String(error)}`);
        // Don't throw - logging failures should not break application flow
    }
};
exports.logAuditEvent = logAuditEvent;
/**
 * Log security event with monitoring flag
 */
const logSecurityEvent = async (userId, email, action, description, ipAddress, userAgent) => {
    try {
        await (0, exports.logAuditEvent)({
            userId,
            email,
            action,
            description,
            ipAddress,
            userAgent,
            status: "SUCCESS",
        });
        // Security events are also logged to console
        logger_1.default.warn(`[SECURITY] ${action} | Email: ${email} | IP: ${ipAddress} | ${description}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to log security event: ${error instanceof Error ? error.message : String(error)}`);
    }
};
exports.logSecurityEvent = logSecurityEvent;
/**
 * Get audit logs for a user
 */
const getUserAuditLogs = async (userId, limit = 50, offset = 0) => {
    try {
        return await database_1.default.auditLog.findMany({
            where: { userId },
            orderBy: { timestamp: "desc" },
            take: limit,
            skip: offset,
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to fetch audit logs: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
};
exports.getUserAuditLogs = getUserAuditLogs;
/**
 * Get audit logs by action type
 */
const getAuditLogsByAction = async (action, limit = 100, offset = 0) => {
    try {
        return await database_1.default.auditLog.findMany({
            where: { action },
            orderBy: { timestamp: "desc" },
            take: limit,
            skip: offset,
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to fetch audit logs by action: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
};
exports.getAuditLogsByAction = getAuditLogsByAction;
/**
 * Get recent security events
 */
const getRecentSecurityEvents = async (limit = 50) => {
    try {
        const securityActions = [
            AuditAction.FAILED_LOGIN,
            AuditAction.ACCOUNT_LOCKED,
            AuditAction.SUSPICIOUS_ACTIVITY,
            AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
        ];
        return await database_1.default.auditLog.findMany({
            where: {
                action: { in: securityActions },
            },
            orderBy: { timestamp: "desc" },
            take: limit,
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to fetch security events: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
};
exports.getRecentSecurityEvents = getRecentSecurityEvents;
exports.default = {
    logAuditEvent: exports.logAuditEvent,
    logSecurityEvent: exports.logSecurityEvent,
    getUserAuditLogs: exports.getUserAuditLogs,
    getAuditLogsByAction: exports.getAuditLogsByAction,
    getRecentSecurityEvents: exports.getRecentSecurityEvents,
    getIpAddress: exports.getIpAddress,
    getUserAgent: exports.getUserAgent,
    AuditAction,
};
