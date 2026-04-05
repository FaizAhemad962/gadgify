import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middlewares/auth";
import { DeliveryAssignmentService } from "../services/deliveryAssignmentService";
import { DeliveryTrackingService } from "../services/deliveryTrackingService";
import { DeliveryMetricsService } from "../services/deliveryMetricsService";
import { DeliveryEarningsService } from "../services/deliveryEarningsService";

/**
 * GET /api/delivery/dashboard
 * Staff member's dashboard with key metrics
 */
export const getDeliveryDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const staffId = req.user?.id!;

    const metrics = await DeliveryMetricsService.getMetrics(staffId);
    const todayEarnings =
      await DeliveryEarningsService.getTodayEarnings(staffId);
    const activeDeliveries =
      await DeliveryAssignmentService.getStaffActiveDeliveries(staffId);

    res.status(200).json({
      success: true,
      message: "Dashboard data retrieved",
      data: {
        earnings: todayEarnings,
        metrics,
        activeDeliveries: activeDeliveries.length,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/delivery/active-orders
 * Get list of active orders assigned to staff
 */
export const getActiveOrders = async (req: AuthRequest, res: Response) => {
  try {
    const staffId = req.user?.id!;

    const activeDeliveries =
      await DeliveryAssignmentService.getStaffActiveDeliveries(staffId);

    res.status(200).json({
      success: true,
      message: "Active orders retrieved",
      data: activeDeliveries,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/delivery/orders/:orderId/accept
 * Staff member accepts a delivery assignment
 */
export const acceptDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const staffId = req.user?.id!;

    const assignment = await DeliveryAssignmentService.acceptOrder(
      orderId,
      staffId,
    );

    res.status(200).json({
      success: true,
      message: "Delivery accepted",
      data: assignment,
    });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }
    throw error;
  }
};

/**
 * POST /api/delivery/orders/:orderId/reject
 * Staff member rejects a delivery assignment
 */
export const rejectDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const staffId = req.user?.id!;

    const assignment = await DeliveryAssignmentService.rejectOrder(
      orderId,
      staffId,
      reason,
    );

    res.status(200).json({
      success: true,
      message: "Delivery rejected",
      data: assignment,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/delivery/location
 * Update current GPS location
 */
export const updateLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { coordinates, assignmentId } = req.body;
    const staffId = req.user?.id!;

    const tracking = await DeliveryTrackingService.updateLocation(
      assignmentId,
      staffId,
      { latitude: coordinates.latitude, longitude: coordinates.longitude },
    );

    res.status(200).json({
      success: true,
      message: "Location updated",
      data: tracking,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/delivery/orders/:orderId/pickup
 * Mark order as picked up
 */
export const markPickup = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const staffId = req.user?.id!;

    const assignment = await DeliveryAssignmentService.markPickedUp(
      orderId,
      staffId,
    );

    res.status(200).json({
      success: true,
      message: "Marked as picked up",
      data: assignment,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/delivery/orders/:orderId/delivered
 * Mark order as delivered
 */
export const markDelivered = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;
    const staffId = req.user?.id!;

    const assignment = await DeliveryAssignmentService.markDelivered(
      orderId,
      staffId,
      note,
    );

    // Get assignment details for earnings calculation
    const assignmentData = await prisma.deliveryAssignment.findUnique({
      where: { orderId },
    });

    if (!assignmentData) {
      throw new Error("Assignment not found");
    }

    // Calculate and record earnings
    const basePayment = 50; // Base delivery fee in rupees
    const bonusAmount = 0;
    const deductionAmount = 0;
    const earningsBreakdown = {
      basePayment,
      bonusAmount,
      deductionAmount,
      totalAmount: basePayment - deductionAmount + bonusAmount,
      breakdown: {
        basePayment: `Rs ${basePayment}`,
        bonuses: bonusAmount > 0 ? [`Bonus: Rs ${bonusAmount}`] : [],
        deductions:
          deductionAmount > 0 ? [`Deduction: Rs ${deductionAmount}`] : [],
      },
    };

    const earning = await DeliveryEarningsService.recordDeliveryEarnings(
      assignmentData.id,
      staffId,
      earningsBreakdown,
    );

    res.status(200).json({
      success: true,
      message: "Marked as delivered",
      data: {
        assignment,
        earning,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/delivery/earnings/today
 * Get today's earnings
 */
export const getTodayEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const staffId = req.user?.id!;

    const earnings = await DeliveryEarningsService.getTodayEarnings(staffId);

    res.status(200).json({
      success: true,
      message: "Earnings retrieved",
      data: earnings,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/delivery/metrics
 * Get staff performance metrics
 */
export const getMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const staffId = req.user?.id!;

    const metrics = await DeliveryMetricsService.getMetrics(staffId);

    res.status(200).json({
      success: true,
      message: "Metrics retrieved",
      data: metrics,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/delivery/status/online
 * Set availability status
 */
export const setOnlineStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const staffId = req.user?.id!;

    if (status === "ONLINE") {
      await DeliveryMetricsService.goOnline(staffId);
    } else if (status === "OFFLINE") {
      await DeliveryMetricsService.goOffline(staffId);
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: null,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/delivery/orders/:orderId/feedback
 * Submit feedback after delivery
 */
export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: "Feedback submitted",
      data: null,
    });
  } catch (error) {
    throw error;
  }
};
