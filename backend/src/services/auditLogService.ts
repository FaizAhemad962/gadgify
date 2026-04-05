import prisma from "../config/database";

export interface AuditLogData {
  userId: string;
  action: string;
  description?: string;
  email: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: "SUCCESS" | "FAILED";
}

class AuditLogService {
  /**
   * Log an action for audit trail
   */
  async logAction(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
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
    } catch (error) {
      console.error("Failed to log audit action:", error);
      // Don't throw - audit logging should not block main operations
    }
  }

  /**
   * Get all audit logs for a user
   */
  async getUserAuditLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    return await prisma.auditLog.findMany({
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
  async getEmailAuditLogs(
    email: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    return await prisma.auditLog.findMany({
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
  async getAuditLogsByAction(
    action: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    return await prisma.auditLog.findMany({
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
  async getFailedAuditLogs(limit: number = 50, offset: number = 0) {
    return await prisma.auditLog.findMany({
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
    const [
      totalLogs,
      loginCount,
      roleChanges,
      accountCreations,
      failedActions,
    ] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { action: "LOGIN" } }),
      prisma.auditLog.count({ where: { action: "ROLE_CHANGED" } }),
      prisma.auditLog.count({ where: { action: "ACCOUNT_CREATED" } }),
      prisma.auditLog.count({ where: { status: "FAILED" } }),
    ]);

    // Get recent activity
    const recentActivity = await prisma.auditLog.findMany({
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
  async cleanOldLogs(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

export default new AuditLogService();
