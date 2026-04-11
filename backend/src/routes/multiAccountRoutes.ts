import { Router } from "express";
import {
  getUserAuditLogs,
  getEmailAuditLogs,
  getAuditLogsByAction,
  getFailedAuditLogs,
  getAuditDashboard,
  cleanOldLogs,
} from "../controllers/auditLogController";
import { authenticate, authorize } from "../middlewares/auth";
// Removed unused imports after disabling multi-account routes

const router = Router();

// All routes require authentication
router.use(authenticate);

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
    message:
      "Multi-account creation has been disabled. One email = one account",
  });
});

// ===== AUDIT LOG ROUTES =====

// Get current user's audit logs
router.get("/audit-logs/my-logs", getUserAuditLogs);

// Get audit logs for an email
router.get("/audit-logs/email/:email", getEmailAuditLogs);

// ===== ADMIN-ONLY ROUTES =====

router.use(authorize("ADMIN", "SUPER_ADMIN"));

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
router.get("/audit-logs/action/:action", getAuditLogsByAction);

// Get failed audit logs
router.get("/audit-logs/failed", getFailedAuditLogs);

// Get audit dashboard
router.get("/audit-logs/dashboard", getAuditDashboard);

// Clean old audit logs (SUPER_ADMIN only)
router.post("/audit-logs/clean", cleanOldLogs);

export default router;
