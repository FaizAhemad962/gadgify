import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import auditLogService from "../services/auditLogService";

export const getUserAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await auditLogService.getUserAuditLogs(
      req.user.id,
      limit,
      offset,
    );

    res.json({
      success: true,
      message: "Audit logs fetched",
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmailAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    // Only allow users to view their own email logs (or admins view any)
    const email =
      req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN"
        ? req.params.email || req.user.email
        : req.user.email;

    const limit = Math.min(parseInt(req.query.limit as string) || 100, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await auditLogService.getEmailAuditLogs(email, limit, offset);

    res.json({
      success: true,
      message: "Email audit logs fetched",
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogsByAction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Only admins can view audit logs by action
    if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const { action } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await auditLogService.getAuditLogsByAction(
      action,
      limit,
      offset,
    );

    res.json({
      success: true,
      message: `Audit logs for action: ${action}`,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getFailedAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Only admins can view failed logs
    if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await auditLogService.getFailedAuditLogs(limit, offset);

    res.json({
      success: true,
      message: "Failed audit logs",
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Only admins can access dashboard
    if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const dashboard = await auditLogService.getAuditDashboard();

    res.json({
      success: true,
      message: "Audit dashboard retrieved",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const cleanOldLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
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
    const deleted = await auditLogService.cleanOldLogs(daysOld);

    res.json({
      success: true,
      message: `Deleted ${deleted} audit logs older than ${daysOld} days`,
      data: { deletedCount: deleted },
    });
  } catch (error) {
    next(error);
  }
};
