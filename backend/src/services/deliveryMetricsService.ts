// backend/src/services/deliveryMetricsService.ts
import prisma from "../config/database";
import { logger } from "../config/logger";
import ConfigService from "./configService";

export class DeliveryMetricsService {
  /**
   * Initialize metrics for new delivery staff
   */
  static async initializeMetrics(deliveryStaffId: string) {
    try {
      const existing = await prisma.deliveryMetrics.findUnique({
        where: { deliveryStaffId },
      });

      if (existing) {
        return existing;
      }

      const metrics = await prisma.deliveryMetrics.create({
        data: {
          deliveryStaffId,
          todayDeliveries: 0,
          todayEarnings: 0,
          todayHoursActive: 0,
          todayDistance: 0,
          totalDeliveries: 0,
          totalEarnings: 0,
          totalDistance: 0,
          totalHoursActive: 0,
          averageRating: 0,
          isOnline: false,
        },
      });

      logger.info(`Metrics initialized for staff ${deliveryStaffId}`);
      return metrics;
    } catch (error) {
      logger.error("Error initializing metrics:", error);
      throw error;
    }
  }

  /**
   * Update metrics when delivery is completed
   */
  static async updateMetricsOnDelivery(
    assignmentId: string,
    deliveryStaffId: string,
  ) {
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      // Calculate delivery time
      let deliveryTimeMinutes = 0;
      if (assignment.acceptedAt && assignment.deliveryAt) {
        const duration =
          assignment.deliveryAt.getTime() - assignment.acceptedAt.getTime();
        deliveryTimeMinutes = Math.floor(duration / (1000 * 60));
      }

      // Check if on-time
      const expectedTime = assignment.expectedDeliveryAt;
      const actualTime = assignment.deliveryAt;
      const isOnTime = expectedTime && actualTime && actualTime <= expectedTime;

      // Update metrics
      const metrics = await prisma.deliveryMetrics.findUnique({
        where: { deliveryStaffId },
      });

      if (!metrics) {
        throw new Error("Metrics not found");
      }

      const newAverageTime =
        metrics.averageDeliveryTime === null
          ? deliveryTimeMinutes
          : (metrics.averageDeliveryTime + deliveryTimeMinutes) / 2;

      const totalDeliveries = metrics.totalDeliveries + 1;
      const onTimeDeliveries = isOnTime
        ? metrics.totalDeliveries + 1
        : metrics.totalDeliveries;
      const onTimePercent = (onTimeDeliveries / totalDeliveries) * 100;

      const updated = await prisma.deliveryMetrics.update({
        where: { deliveryStaffId },
        data: {
          totalDeliveries,
          todayDeliveries: metrics.todayDeliveries + 1,
          averageDeliveryTime: Math.floor(newAverageTime),
          onTimeDeliveryPercent: onTimePercent,
          todayDistance:
            metrics.todayDistance + (assignment.distanceTraveled || 0),
          totalDistance:
            metrics.totalDistance + (assignment.distanceTraveled || 0),
        },
      });

      logger.info(`Metrics updated for delivery ${assignmentId}`);
      return updated;
    } catch (error) {
      logger.error("Error updating metrics:", error);
      throw error;
    }
  }

  /**
   * Update metrics when delivery is rated
   */
  static async updateMetricsWithRating(
    deliveryStaffId: string,
    rating: number,
  ) {
    try {
      const metrics = await prisma.deliveryMetrics.findUnique({
        where: { deliveryStaffId },
      });

      if (!metrics) {
        throw new Error("Metrics not found");
      }

      const totalRatings = metrics.totalRatings + 1;
      const newAverageRating =
        (metrics.averageRating * metrics.totalRatings + rating) / totalRatings;

      // Update rating distribution
      let distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      if (metrics.ratingDistributionJson) {
        try {
          distribution = JSON.parse(metrics.ratingDistributionJson);
        } catch (e) {
          logger.warn("Invalid rating distribution JSON");
        }
      }

      distribution[rating as keyof typeof distribution]++;

      const updated = await prisma.deliveryMetrics.update({
        where: { deliveryStaffId },
        data: {
          totalRatings,
          averageRating: Math.round(newAverageRating * 10) / 10,
          ratingDistributionJson: JSON.stringify(distribution),
        },
      });

      logger.info(`Rating metrics updated for staff ${deliveryStaffId}`);
      return updated;
    } catch (error) {
      logger.error("Error updating rating metrics:", error);
      throw error;
    }
  }

  /**
   * Mark delivery staff as online
   */
  static async goOnline(deliveryStaffId: string) {
    try {
      let metrics = await prisma.deliveryMetrics.findUnique({
        where: { deliveryStaffId },
      });

      if (!metrics) {
        metrics = await this.initializeMetrics(deliveryStaffId);
      }

      const updated = await prisma.deliveryMetrics.update({
        where: { deliveryStaffId },
        data: {
          isOnline: true,
          lastOnlineAt: new Date(),
        },
      });

      // Update user status
      await prisma.user.update({
        where: { id: deliveryStaffId },
        data: { updatedAt: new Date() },
      });

      logger.info(`Staff ${deliveryStaffId} went online`);
      return updated;
    } catch (error) {
      logger.error("Error marking online:", error);
      throw error;
    }
  }

  /**
   * Mark delivery staff as offline
   */
  static async goOffline(deliveryStaffId: string) {
    try {
      const metrics = await prisma.deliveryMetrics.findUnique({
        where: { deliveryStaffId },
      });

      if (!metrics) {
        throw new Error("Metrics not found");
      }

      // Calculate hours active today
      const hoursActive = metrics.lastOnlineAt
        ? (Date.now() - metrics.lastOnlineAt.getTime()) / (1000 * 60 * 60)
        : 0;

      const updated = await prisma.deliveryMetrics.update({
        where: { deliveryStaffId },
        data: {
          isOnline: false,
          lastOfflineAt: new Date(),
          todayHoursActive: metrics.todayHoursActive + hoursActive,
          totalHoursActive: metrics.totalHoursActive + hoursActive,
        },
      });

      logger.info(`Staff ${deliveryStaffId} went offline`);
      return updated;
    } catch (error) {
      logger.error("Error marking offline:", error);
      throw error;
    }
  }

  /**
   * Reset today's metrics (call at midnight/daily reset)
   */
  static async resetDailyMetrics() {
    try {
      const updated = await prisma.deliveryMetrics.updateMany({
        data: {
          todayDeliveries: 0,
          todayEarnings: 0,
          todayHoursActive: 0,
          todayDistance: 0,
        },
      });

      logger.info(`Daily metrics reset for ${updated.count} staff`);
      return updated;
    } catch (error) {
      logger.error("Error resetting daily metrics:", error);
      throw error;
    }
  }

  /**
   * Get metrics for a delivery staff
   */
  static async getMetrics(deliveryStaffId: string) {
    try {
      let metrics = await prisma.deliveryMetrics.findUnique({
        where: { deliveryStaffId },
      });

      if (!metrics) {
        metrics = await this.initializeMetrics(deliveryStaffId);
      }

      return metrics;
    } catch (error) {
      logger.error("Error getting metrics:", error);
      return null;
    }
  }

  /**
   * Get performance analytics for admin dashboard
   */
  static async getPerformanceAnalytics(deliveryStaffId?: string) {
    try {
      const query = {
        ...(deliveryStaffId && { deliveryStaffId }),
      };

      const metrics = await prisma.deliveryMetrics.findMany({
        where: query,
        include: {
          deliveryStaff: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { averageRating: "desc" },
      });

      return metrics;
    } catch (error) {
      logger.error("Error getting performance analytics:", error);
      return [];
    }
  }

  /**
   * Check if delivery staff meets minimum requirements
   */
  static async meettsMinimumRequirements(
    deliveryStaffId: string,
  ): Promise<boolean> {
    try {
      const minimumRating = await ConfigService.getConfig<number>(
        "delivery_rating_required_for_payout",
        3,
      );

      const metrics = await this.getMetrics(deliveryStaffId);
      return metrics ? metrics.averageRating >= minimumRating : false;
    } catch (error) {
      logger.error("Error checking requirements:", error);
      return false;
    }
  }
}

export default DeliveryMetricsService;
