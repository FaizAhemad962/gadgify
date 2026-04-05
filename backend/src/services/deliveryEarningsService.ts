// backend/src/services/deliveryEarningsService.ts
import prisma from "../config/database";
import { logger } from "../config/logger";
import ConfigService from "./configService";
import DeliveryMetricsService from "./deliveryMetricsService";

interface EarningsBreakdown {
  basePayment: number;
  bonusAmount: number;
  deductionAmount: number;
  totalAmount: number;
  breakdown: {
    basePayment: string;
    bonuses: string[];
    deductions: string[];
  };
}

export class DeliveryEarningsService {
  /**
   * Calculate earnings for a completed delivery
   */
  static async calculateDeliveryEarnings(
    assignmentId: string,
    deliveryStaffId: string,
  ): Promise<EarningsBreakdown> {
    try {
      // Get configuration
      const [
        basePayment,
        onTimeBonusMultiplier,
        earlyDeliveryBonus,
        highRatingBonus,
      ] = await Promise.all([
        ConfigService.getConfig<number>("payment_per_delivery", 30),
        ConfigService.getConfig<number>("on_time_bonus_multiplier", 1.5),
        ConfigService.getConfig<number>("early_delivery_bonus", 10),
        ConfigService.getConfig<number>("high_rating_bonus_threshold", 4.5),
      ]);

      // Get assignment details
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { id: assignmentId },
        include: { order: true },
      });

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      let totalEarnings = basePayment;
      const bonuses: string[] = [];
      const deductions: string[] = [];

      // Check for on-time delivery bonus
      if (assignment.expectedDeliveryAt && assignment.deliveryAt) {
        const isOnTime = assignment.deliveryAt <= assignment.expectedDeliveryAt;
        const minutesEarly =
          assignment.expectedDeliveryAt.getTime() -
          assignment.deliveryAt.getTime();

        if (isOnTime) {
          const timeBonusPercent = (onTimeBonusMultiplier - 1) * 100;
          const timeBonus = Math.round((basePayment * timeBonusPercent) / 100);
          totalEarnings += timeBonus;
          bonuses.push(`On-time delivery bonus: ₹${timeBonus}`);

          // Extra bonus if very early
          if (minutesEarly > 30 * 60000) {
            const extraBonus = Math.round(earlyDeliveryBonus);
            totalEarnings += extraBonus;
            bonuses.push(`Early delivery bonus: ₹${extraBonus}`);
          }
        }
      }

      // Check for high rating bonus (can be added from customer rating if available)
      // For now, this will be updated after customer rates the delivery

      // Check for deductions (cancellations, failed deliveries)
      if (assignment.deliveryStatus === "FAILED") {
        const cancellationPenalty = await ConfigService.getConfig<number>(
          "cancellation_penalty_percent",
          25,
        );
        const penalty = Math.round((basePayment * cancellationPenalty) / 100);
        totalEarnings -= penalty;
        deductions.push(`Failed delivery penalty: -₹${penalty}`);
      }

      return {
        basePayment,
        bonusAmount: totalEarnings - basePayment,
        deductionAmount: 0, // Calculated separately
        totalAmount: totalEarnings,
        breakdown: {
          basePayment: `₹${basePayment}`,
          bonuses,
          deductions,
        },
      };
    } catch (error) {
      logger.error("Error calculating earnings:", error);
      throw error;
    }
  }

  /**
   * Create earnings record for completed delivery
   */
  static async recordDeliveryEarnings(
    assignmentId: string,
    deliveryStaffId: string,
    earningsBreakdown: EarningsBreakdown,
  ) {
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      // Determine bonus reason
      let bonusReason = "DELIVERY_COMPLETED";
      if (earningsBreakdown.bonusAmount > 0) {
        bonusReason = "ON_TIME_DELIVERY";
      }

      const earnings = await prisma.deliveryEarnings.create({
        data: {
          deliveryStaffId,
          assignmentId,
          basePayment: earningsBreakdown.basePayment,
          bonusAmount: Math.max(0, earningsBreakdown.bonusAmount),
          deductionAmount: Math.max(0, -earningsBreakdown.bonusAmount),
          totalAmount: earningsBreakdown.totalAmount,
          bonusReason,
          date: new Date(),
          status: "PENDING",
        },
      });

      // Update metrics
      const metrics = await prisma.deliveryMetrics.findUnique({
        where: { deliveryStaffId },
      });

      if (metrics) {
        await prisma.deliveryMetrics.update({
          where: { deliveryStaffId },
          data: {
            todayEarnings:
              metrics.todayEarnings + earningsBreakdown.totalAmount,
            totalEarnings:
              metrics.totalEarnings + earningsBreakdown.totalAmount,
          },
        });
      }

      logger.info(
        `Earnings recorded: ${assignmentId} = ₹${earningsBreakdown.totalAmount}`,
      );
      return earnings;
    } catch (error) {
      logger.error("Error recording earnings:", error);
      throw error;
    }
  }

  /**
   * Get earnings for a delivery staff member
   */
  static async getStaffEarnings(
    deliveryStaffId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      const query = {
        deliveryStaffId,
        ...(startDate &&
          endDate && {
            date: {
              gte: startDate,
              lte: endDate,
            },
          }),
      };

      const earnings = await prisma.deliveryEarnings.findMany({
        where: query,
        orderBy: { date: "desc" },
      });

      const summary = {
        total: earnings.reduce((sum, e) => sum + e.totalAmount, 0),
        pending: earnings
          .filter((e) => e.status === "PENDING")
          .reduce((sum, e) => sum + e.totalAmount, 0),
        processed: earnings
          .filter((e) => e.status === "PROCESSED")
          .reduce((sum, e) => sum + e.totalAmount, 0),
        paid: earnings
          .filter((e) => e.status === "PAID")
          .reduce((sum, e) => sum + e.totalAmount, 0),
        count: earnings.length,
      };

      return { earnings, summary };
    } catch (error) {
      logger.error("Error getting earnings:", error);
      return {
        earnings: [],
        summary: { total: 0, pending: 0, processed: 0, paid: 0, count: 0 },
      };
    }
  }

  /**
   * Get today's earnings for dashboard
   */
  static async getTodayEarnings(deliveryStaffId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const earnings = await prisma.deliveryEarnings.findMany({
        where: {
          deliveryStaffId,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      const total = earnings.reduce((sum, e) => sum + e.totalAmount, 0);
      const count = earnings.length;

      return { earnings, total, count };
    } catch (error) {
      logger.error("Error getting today earnings:", error);
      return { earnings: [], total: 0, count: 0 };
    }
  }

  /**
   * Get monthly earnings breakdown
   */
  static async getMonthlyEarnings(
    deliveryStaffId: string,
    year: number,
    month: number,
  ) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      const earnings = await prisma.deliveryEarnings.findMany({
        where: {
          deliveryStaffId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "asc" },
      });

      // Group by week for graph
      const weeks: Record<number, number> = {};
      earnings.forEach((e) => {
        const week = Math.ceil(e.date.getDate() / 7);
        weeks[week] = (weeks[week] || 0) + e.totalAmount;
      });

      const total = earnings.reduce((sum, e) => sum + e.totalAmount, 0);

      return {
        earnings,
        total,
        weeklyBreakdown: weeks,
        averagePerDay: total / (endDate.getDate() || 30),
      };
    } catch (error) {
      logger.error("Error getting monthly earnings:", error);
      return {
        earnings: [],
        total: 0,
        weeklyBreakdown: {},
        averagePerDay: 0,
      };
    }
  }

  /**
   * Process payout for delivery staff
   * Called by admin to mark earnings as paid
   */
  static async processPayout(
    deliveryStaffId: string,
    earningIds: string[],
    paymentMethod: "BANK_TRANSFER" | "UPIPI" = "BANK_TRANSFER",
  ) {
    try {
      // Verify staff meets minimum requirements
      const meetsRequirements =
        await DeliveryMetricsService.meettsMinimumRequirements(deliveryStaffId);

      if (!meetsRequirements) {
        throw new Error(
          "Staff does not meet minimum rating requirements for payout",
        );
      }

      // Update earnings status
      const updated = await prisma.deliveryEarnings.updateMany({
        where: {
          id: { in: earningIds },
          deliveryStaffId,
          status: "PENDING",
        },
        data: {
          status: "PROCESSED",
          paidAt: new Date(),
        },
      });

      logger.info(
        `Payout processed for ${deliveryStaffId}: ${updated.count} earnings`,
      );
      return updated;
    } catch (error) {
      logger.error("Error processing payout:", error);
      throw error;
    }
  }

  /**
   * Calculate bonus tier earnings
   */
  static async calculateBonusIfEligible(deliveryStaffId: string) {
    try {
      const bonusThreshold = await ConfigService.getConfig<number>(
        "bonus_threshold_deliveries",
        50,
      );
      const bonusAmount = await ConfigService.getConfig<number>(
        "bonus_per_50_deliveries",
        200,
      );

      const metrics = await prisma.deliveryMetrics.findUnique({
        where: { deliveryStaffId },
      });

      if (!metrics || metrics.totalDeliveries < bonusThreshold) {
        return null;
      }

      // Check if bonus already paid for this tier
      const tierNumber = Math.floor(metrics.totalDeliveries / bonusThreshold);

      const existing = await prisma.deliveryEarnings.findFirst({
        where: {
          deliveryStaffId,
          bonusReason: `VOLUME_BONUS_TIER_${tierNumber}`,
        },
      });

      if (existing) {
        return null; // Already paid for this tier
      }

      // Create bonus earning record
      const bonus = await prisma.deliveryEarnings.create({
        data: {
          deliveryStaffId,
          basePayment: 0,
          bonusAmount: bonusAmount,
          deductionAmount: 0,
          totalAmount: bonusAmount,
          bonusReason: `VOLUME_BONUS_TIER_${tierNumber}`,
          date: new Date(),
          status: "PENDING",
        },
      });

      logger.info(
        `Volume bonus created for ${deliveryStaffId}: Tier ${tierNumber}, Amount: ₹${bonusAmount}`,
      );
      return bonus;
    } catch (error) {
      logger.error("Error calculating bonus:", error);
      return null;
    }
  }
}

export default DeliveryEarningsService;
