"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryEarningsService = void 0;
// backend/src/services/deliveryEarningsService.ts
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../config/logger");
const configService_1 = __importDefault(require("./configService"));
const deliveryMetricsService_1 = __importDefault(require("./deliveryMetricsService"));
class DeliveryEarningsService {
    /**
     * Calculate earnings for a completed delivery
     */
    static async calculateDeliveryEarnings(assignmentId, deliveryStaffId) {
        try {
            // Get configuration
            const [basePayment, onTimeBonusMultiplier, earlyDeliveryBonus, highRatingBonus,] = await Promise.all([
                configService_1.default.getConfig("payment_per_delivery", 30),
                configService_1.default.getConfig("on_time_bonus_multiplier", 1.5),
                configService_1.default.getConfig("early_delivery_bonus", 10),
                configService_1.default.getConfig("high_rating_bonus_threshold", 4.5),
            ]);
            // Get assignment details
            const assignment = await database_1.default.deliveryAssignment.findUnique({
                where: { id: assignmentId },
                include: { order: true },
            });
            if (!assignment) {
                throw new Error("Assignment not found");
            }
            let totalEarnings = basePayment;
            const bonuses = [];
            const deductions = [];
            // Check for on-time delivery bonus
            if (assignment.expectedDeliveryAt && assignment.deliveryAt) {
                const isOnTime = assignment.deliveryAt <= assignment.expectedDeliveryAt;
                const minutesEarly = assignment.expectedDeliveryAt.getTime() -
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
                const cancellationPenalty = await configService_1.default.getConfig("cancellation_penalty_percent", 25);
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
        }
        catch (error) {
            logger_1.logger.error("Error calculating earnings:", error);
            throw error;
        }
    }
    /**
     * Create earnings record for completed delivery
     */
    static async recordDeliveryEarnings(assignmentId, deliveryStaffId, earningsBreakdown) {
        try {
            const assignment = await database_1.default.deliveryAssignment.findUnique({
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
            const earnings = await database_1.default.deliveryEarnings.create({
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
            const metrics = await database_1.default.deliveryMetrics.findUnique({
                where: { deliveryStaffId },
            });
            if (metrics) {
                await database_1.default.deliveryMetrics.update({
                    where: { deliveryStaffId },
                    data: {
                        todayEarnings: metrics.todayEarnings + earningsBreakdown.totalAmount,
                        totalEarnings: metrics.totalEarnings + earningsBreakdown.totalAmount,
                    },
                });
            }
            logger_1.logger.info(`Earnings recorded: ${assignmentId} = ₹${earningsBreakdown.totalAmount}`);
            return earnings;
        }
        catch (error) {
            logger_1.logger.error("Error recording earnings:", error);
            throw error;
        }
    }
    /**
     * Get earnings for a delivery staff member
     */
    static async getStaffEarnings(deliveryStaffId, startDate, endDate) {
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
            const earnings = await database_1.default.deliveryEarnings.findMany({
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
        }
        catch (error) {
            logger_1.logger.error("Error getting earnings:", error);
            return {
                earnings: [],
                summary: { total: 0, pending: 0, processed: 0, paid: 0, count: 0 },
            };
        }
    }
    /**
     * Get today's earnings for dashboard
     */
    static async getTodayEarnings(deliveryStaffId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const earnings = await database_1.default.deliveryEarnings.findMany({
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
        }
        catch (error) {
            logger_1.logger.error("Error getting today earnings:", error);
            return { earnings: [], total: 0, count: 0 };
        }
    }
    /**
     * Get monthly earnings breakdown
     */
    static async getMonthlyEarnings(deliveryStaffId, year, month) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            endDate.setHours(23, 59, 59, 999);
            const earnings = await database_1.default.deliveryEarnings.findMany({
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
            const weeks = {};
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
        }
        catch (error) {
            logger_1.logger.error("Error getting monthly earnings:", error);
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
    static async processPayout(deliveryStaffId, earningIds, paymentMethod = "BANK_TRANSFER") {
        try {
            // Verify staff meets minimum requirements
            const meetsRequirements = await deliveryMetricsService_1.default.meettsMinimumRequirements(deliveryStaffId);
            if (!meetsRequirements) {
                throw new Error("Staff does not meet minimum rating requirements for payout");
            }
            // Update earnings status
            const updated = await database_1.default.deliveryEarnings.updateMany({
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
            logger_1.logger.info(`Payout processed for ${deliveryStaffId}: ${updated.count} earnings`);
            return updated;
        }
        catch (error) {
            logger_1.logger.error("Error processing payout:", error);
            throw error;
        }
    }
    /**
     * Calculate bonus tier earnings
     */
    static async calculateBonusIfEligible(deliveryStaffId) {
        try {
            const bonusThreshold = await configService_1.default.getConfig("bonus_threshold_deliveries", 50);
            const bonusAmount = await configService_1.default.getConfig("bonus_per_50_deliveries", 200);
            const metrics = await database_1.default.deliveryMetrics.findUnique({
                where: { deliveryStaffId },
            });
            if (!metrics || metrics.totalDeliveries < bonusThreshold) {
                return null;
            }
            // Check if bonus already paid for this tier
            const tierNumber = Math.floor(metrics.totalDeliveries / bonusThreshold);
            const existing = await database_1.default.deliveryEarnings.findFirst({
                where: {
                    deliveryStaffId,
                    bonusReason: `VOLUME_BONUS_TIER_${tierNumber}`,
                },
            });
            if (existing) {
                return null; // Already paid for this tier
            }
            // Create bonus earning record
            const bonus = await database_1.default.deliveryEarnings.create({
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
            logger_1.logger.info(`Volume bonus created for ${deliveryStaffId}: Tier ${tierNumber}, Amount: ₹${bonusAmount}`);
            return bonus;
        }
        catch (error) {
            logger_1.logger.error("Error calculating bonus:", error);
            return null;
        }
    }
}
exports.DeliveryEarningsService = DeliveryEarningsService;
exports.default = DeliveryEarningsService;
