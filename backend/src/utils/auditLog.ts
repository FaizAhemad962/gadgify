/**
 * ✅ SECURITY: Activity logging and audit trails
 * Logs all important actions for security monitoring and compliance
 */

import prisma from "../config/database";
import logger from "./logger";

export enum AuditAction {
  // Authentication
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  SIGNUP = "SIGNUP",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  PASSWORD_RESET = "PASSWORD_RESET",
  EMAIL_VERIFIED = "EMAIL_VERIFIED",

  // User Management
  PROFILE_UPDATE = "PROFILE_UPDATE",
  PROFILE_PHOTO_UPDATE = "PROFILE_PHOTO_UPDATE",
  ROLE_CHANGE = "ROLE_CHANGE",

  // Product Management
  PRODUCT_CREATE = "PRODUCT_CREATE",
  PRODUCT_UPDATE = "PRODUCT_UPDATE",
  PRODUCT_DELETE = "PRODUCT_DELETE",
  PRODUCT_PUBLISH = "PRODUCT_PUBLISH",
  PRODUCT_UNPUBLISH = "PRODUCT_UNPUBLISH",

  // Order Management
  ORDER_CREATE = "ORDER_CREATE",
  ORDER_CANCEL = "ORDER_CANCEL",
  ORDER_REFUND = "ORDER_REFUND",
  ORDER_STATUS_CHANGE = "ORDER_STATUS_CHANGE",

  // Admin Actions
  ADMIN_USER_DELETE = "ADMIN_USER_DELETE",
  ADMIN_ROLE_GRANT = "ADMIN_ROLE_GRANT",
  ADMIN_ROLE_REVOKE = "ADMIN_ROLE_REVOKE",
  ADMIN_SETTINGS_UPDATE = "ADMIN_SETTINGS_UPDATE",

  // Security Events
  FAILED_LOGIN = "FAILED_LOGIN",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  UNAUTHORIZED_ACCESS_ATTEMPT = "UNAUTHORIZED_ACCESS_ATTEMPT",

  // File Operations
  FILE_UPLOAD = "FILE_UPLOAD",
  FILE_DELETE = "FILE_DELETE",
}

export interface AuditLogData {
  userId: string;
  email: string;
  action: AuditAction;
  description?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: "SUCCESS" | "FAILED";
}

/**
 * Extract IP address from request
 */
export const getIpAddress = (req: any): string | undefined => {
  if (!req) return undefined;

  // Check for IP in headers (proxies)
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : forwarded[0];
  }

  return req.socket?.remoteAddress || req.ip;
};

/**
 * Get user agent from request
 */
export const getUserAgent = (req: any): string | undefined => {
  if (!req) return undefined;
  return req.headers["user-agent"];
};

/**
 * Log audit event
 */
export const logAuditEvent = async (data: AuditLogData): Promise<void> => {
  try {
    await prisma.auditLog.create({
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

    logger.debug(
      `[AUDIT] ${data.action} | User: ${data.email} | ${data.description || ""}`,
    );
  } catch (error) {
    logger.error(
      `Failed to log audit event: ${error instanceof Error ? error.message : String(error)}`,
    );
    // Don't throw - logging failures should not break application flow
  }
};

/**
 * Log security event with monitoring flag
 */
export const logSecurityEvent = async (
  userId: string,
  email: string,
  action: AuditAction,
  description: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> => {
  try {
    await logAuditEvent({
      userId,
      email,
      action,
      description,
      ipAddress,
      userAgent,
      status: "SUCCESS",
    });

    // Security events are also logged to console
    logger.warn(
      `[SECURITY] ${action} | Email: ${email} | IP: ${ipAddress} | ${description}`,
    );
  } catch (error) {
    logger.error(
      `Failed to log security event: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Get audit logs for a user
 */
export const getUserAuditLogs = async (
  userId: string,
  limit: number = 50,
  offset: number = 0,
) => {
  try {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
    });
  } catch (error) {
    logger.error(
      `Failed to fetch audit logs: ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }
};

/**
 * Get audit logs by action type
 */
export const getAuditLogsByAction = async (
  action: AuditAction,
  limit: number = 100,
  offset: number = 0,
) => {
  try {
    return await prisma.auditLog.findMany({
      where: { action },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
    });
  } catch (error) {
    logger.error(
      `Failed to fetch audit logs by action: ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }
};

/**
 * Get recent security events
 */
export const getRecentSecurityEvents = async (limit: number = 50) => {
  try {
    const securityActions = [
      AuditAction.FAILED_LOGIN,
      AuditAction.ACCOUNT_LOCKED,
      AuditAction.SUSPICIOUS_ACTIVITY,
      AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT,
    ];

    return await prisma.auditLog.findMany({
      where: {
        action: { in: securityActions },
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  } catch (error) {
    logger.error(
      `Failed to fetch security events: ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }
};

export default {
  logAuditEvent,
  logSecurityEvent,
  getUserAuditLogs,
  getAuditLogsByAction,
  getRecentSecurityEvents,
  getIpAddress,
  getUserAgent,
  AuditAction,
};
