import { Router } from "express";
import {
  getUserAuditLogs,
  getEmailAuditLogs,
  getAuditLogsByAction,
  getFailedAuditLogs,
  getAuditDashboard,
  cleanOldLogs,
} from "../controllers/auditLogController";
import {
  getAccountsByEmail,
  createAdditionalAccount,
  hasMultipleAccounts,
  getMultiAccountStats,
  getAllAccountsGrouped,
} from "../controllers/multiAccountController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createUserSchema } from "../validators";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===== MULTI-ACCOUNT ROUTES =====

// Get accounts for current user's email
router.get("/my-accounts", getAccountsByEmail);

// Check if user has multiple accounts
router.get("/check-multiple", hasMultipleAccounts);

// Create additional account for same email (requires same email)
router.post(
  "/create-additional",
  validate(createUserSchema),
  createAdditionalAccount,
);

// ===== AUDIT LOG ROUTES =====

// Get current user's audit logs
router.get("/audit-logs/my-logs", getUserAuditLogs);

// Get audit logs for an email
router.get("/audit-logs/email/:email", getEmailAuditLogs);

// ===== ADMIN-ONLY ROUTES =====

router.use(authorize("ADMIN", "SUPER_ADMIN"));

// Get multi-account statistics
router.get("/stats", getMultiAccountStats);

// Get all accounts grouped by email
router.get("/all-accounts", getAllAccountsGrouped);

// Get audit logs by action
router.get("/audit-logs/action/:action", getAuditLogsByAction);

// Get failed audit logs
router.get("/audit-logs/failed", getFailedAuditLogs);

// Get audit dashboard
router.get("/audit-logs/dashboard", getAuditDashboard);

// Clean old audit logs (SUPER_ADMIN only)
router.post("/audit-logs/clean", cleanOldLogs);

export default router;
