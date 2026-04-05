import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middlewares/auth";
import { DeliveryTrackingService } from "../services/deliveryTrackingService";
import { DeliveryMetricsService } from "../services/deliveryMetricsService";

/**
 * GET /api/delivery/orders/:orderId/tracking
 * Get real-time tracking information for an order
 */
export const getOrderTracking = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { orderId },
      include: {
        trackingPoints: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned for delivery yet",
        data: null,
      });
    }

    const currentLocation = await DeliveryTrackingService.getCurrentLocation(
      assignment.id,
    );

    // Estimate ETA if delivery is in progress
    let eta = null;
    if (assignment.deliveryStatus === "IN_TRANSIT") {
      eta = await DeliveryTrackingService.estimateETA(assignment.id);
    }

    res.status(200).json({
      success: true,
      message: "Tracking information retrieved",
      data: {
        orderId,
        status: assignment.deliveryStatus,
        tracking: {
          currentLocation,
          eta,
          lastUpdate: assignment.trackingPoints[0]?.createdAt,
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/delivery/orders/:orderId/staff-info
 * Get information about the assigned delivery staff
 */
export const getDeliveryStaffInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { orderId },
      include: { deliveryStaff: true },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned yet",
        data: null,
      });
    }

    const metrics = await DeliveryMetricsService.getMetrics(
      assignment.deliveryStaffId,
    );

    res.status(200).json({
      success: true,
      message: "Delivery staff information retrieved",
      data: {
        staffId: assignment.deliveryStaffId,
        status: assignment.deliveryStatus,
        staff: assignment.deliveryStaff,
        performance: metrics,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/delivery/orders/:orderId/rate
 * Customer rates the delivery and staff performance
 */
export const rateDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { rating, review } = req.body;

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { orderId },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    if (assignment.deliveryStatus !== "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Can only rate completed deliveries",
        data: null,
      });
    }

    // Update metrics with rating
    const updated = await DeliveryMetricsService.updateMetricsWithRating(
      assignment.deliveryStaffId,
      rating,
    );

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: updated,
    });
  } catch (error) {
    throw error;
  }
};
