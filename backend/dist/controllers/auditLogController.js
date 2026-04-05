"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanOldLogs = exports.getAuditDashboard = exports.getFailedAuditLogs = exports.getAuditLogsByAction = exports.getEmailAuditLogs = exports.getUserAuditLogs = void 0;
const auditLogService_1 = __importDefault(require("../services/auditLogService"));
const getUserAuditLogs = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = parseInt(req.query.offset) || 0;
        const logs = await auditLogService_1.default.getUserAuditLogs(req.user.id, limit, offset);
        res.json({
            success: true,
            message: "Audit logs fetched",
            data: logs,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserAuditLogs = getUserAuditLogs;
const getEmailAuditLogs = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        // Only allow users to view their own email logs (or admins view any)
        const email = req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN"
            ? req.params.email || req.user.email
            : req.user.email;
        const limit = Math.min(parseInt(req.query.limit) || 100, 200);
        const offset = parseInt(req.query.offset) || 0;
        const logs = await auditLogService_1.default.getEmailAuditLogs(email, limit, offset);
        res.json({
            success: true,
            message: "Email audit logs fetched",
            data: logs,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEmailAuditLogs = getEmailAuditLogs;
const getAuditLogsByAction = async (req, res, next) => {
    try {
        // Only admins can view audit logs by action
        if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        const { action } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 100, 200);
        const offset = parseInt(req.query.offset) || 0;
        const logs = await auditLogService_1.default.getAuditLogsByAction(action, limit, offset);
        res.json({
            success: true,
            message: `Audit logs for action: ${action}`,
            data: logs,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAuditLogsByAction = getAuditLogsByAction;
const getFailedAuditLogs = async (req, res, next) => {
    try {
        // Only admins can view failed logs
        if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = parseInt(req.query.offset) || 0;
        const logs = await auditLogService_1.default.getFailedAuditLogs(limit, offset);
        res.json({
            success: true,
            message: "Failed audit logs",
            data: logs,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFailedAuditLogs = getFailedAuditLogs;
const getAuditDashboard = async (req, res, next) => {
    try {
        // Only admins can access dashboard
        if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        const dashboard = await auditLogService_1.default.getAuditDashboard();
        res.json({
            success: true,
            message: "Audit dashboard retrieved",
            data: dashboard,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAuditDashboard = getAuditDashboard;
const cleanOldLogs = async (req, res, next) => {
    try {
        // Only super admin can clean logs
        if (!req.user || req.user.role !== "SUPER_ADMIN") {
            res
                .status(403)
                .json({
                success: false,
                message: "Only SUPER_ADMIN can perform this action",
            });
            return;
        }
        const daysOld = parseInt(req.body.daysOld) || 90;
        const deleted = await auditLogService_1.default.cleanOldLogs(daysOld);
        res.json({
            success: true,
            message: `Deleted ${deleted} audit logs older than ${daysOld} days`,
            data: { deletedCount: deleted },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cleanOldLogs = cleanOldLogs;
