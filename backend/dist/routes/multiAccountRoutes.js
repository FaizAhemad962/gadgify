"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditLogController_1 = require("../controllers/auditLogController");
const multiAccountController_1 = require("../controllers/multiAccountController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const validators_1 = require("../validators");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// ===== MULTI-ACCOUNT ROUTES =====
// Get accounts for current user's email
router.get("/my-accounts", multiAccountController_1.getAccountsByEmail);
// Check if user has multiple accounts
router.get("/check-multiple", multiAccountController_1.hasMultipleAccounts);
// Create additional account for same email (requires same email)
router.post("/create-additional", (0, validate_1.validate)(validators_1.createUserSchema), multiAccountController_1.createAdditionalAccount);
// ===== AUDIT LOG ROUTES =====
// Get current user's audit logs
router.get("/audit-logs/my-logs", auditLogController_1.getUserAuditLogs);
// Get audit logs for an email
router.get("/audit-logs/email/:email", auditLogController_1.getEmailAuditLogs);
// ===== ADMIN-ONLY ROUTES =====
router.use((0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"));
// Get multi-account statistics
router.get("/stats", multiAccountController_1.getMultiAccountStats);
// Get all accounts grouped by email
router.get("/all-accounts", multiAccountController_1.getAllAccountsGrouped);
// Get audit logs by action
router.get("/audit-logs/action/:action", auditLogController_1.getAuditLogsByAction);
// Get failed audit logs
router.get("/audit-logs/failed", auditLogController_1.getFailedAuditLogs);
// Get audit dashboard
router.get("/audit-logs/dashboard", auditLogController_1.getAuditDashboard);
// Clean old audit logs (SUPER_ADMIN only)
router.post("/audit-logs/clean", auditLogController_1.cleanOldLogs);
exports.default = router;
