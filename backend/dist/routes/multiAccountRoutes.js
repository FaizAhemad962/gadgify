"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditLogController_1 = require("../controllers/auditLogController");
const auth_1 = require("../middlewares/auth");
// Removed unused imports after disabling multi-account routes
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// ===== MULTI-ACCOUNT ROUTES =====
// Get accounts for current user's email
router.get("/my-accounts", (req, res) => {
    res.status(410).json({
        success: false,
        message: "Multi-account feature has been deprecated",
    });
});
// Check if user has multiple accounts
router.get("/check-multiple", (req, res) => {
    res.status(410).json({
        success: false,
        message: "Multi-account feature has been deprecated",
    });
});
// Create additional account for same email (DISABLED - returning 410 Gone)
router.post("/create-additional", (req, res) => {
    res.status(410).json({
        success: false,
        message: "Multi-account creation has been disabled. One email = one account",
    });
});
// ===== AUDIT LOG ROUTES =====
// Get current user's audit logs
router.get("/audit-logs/my-logs", auditLogController_1.getUserAuditLogs);
// Get audit logs for an email
router.get("/audit-logs/email/:email", auditLogController_1.getEmailAuditLogs);
// ===== ADMIN-ONLY ROUTES =====
router.use((0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"));
// Get multi-account statistics (DISABLED - returning 410 Gone)
router.get("/stats", (req, res) => {
    res.status(410).json({
        success: false,
        message: "Multi-account feature has been deprecated",
    });
});
// Get all accounts grouped by email (DISABLED - returning 410 Gone)
router.get("/all-accounts", (req, res) => {
    res.status(410).json({
        success: false,
        message: "Multi-account feature has been deprecated",
    });
});
// Get audit logs by action
router.get("/audit-logs/action/:action", auditLogController_1.getAuditLogsByAction);
// Get failed audit logs
router.get("/audit-logs/failed", auditLogController_1.getFailedAuditLogs);
// Get audit dashboard
router.get("/audit-logs/dashboard", auditLogController_1.getAuditDashboard);
// Clean old audit logs (SUPER_ADMIN only)
router.post("/audit-logs/clean", auditLogController_1.cleanOldLogs);
exports.default = router;
