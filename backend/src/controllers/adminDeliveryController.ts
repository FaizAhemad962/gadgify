import { Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middlewares/auth";
import { DeliveryAssignmentService } from "../services/deliveryAssignmentService";
import { DeliveryMetricsService } from "../services/deliveryMetricsService";
import { DeliveryTrackingService } from "../services/deliveryTrackingService";

/**
 * POST /api/admin/delivery/assign
 * Admin manually assigns a delivery order to a staff member
 */
export const assignDeliveryToStaff = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { orderId, staffId } = req.body;

    const assignment = await DeliveryAssignmentService.assignOrder(
      orderId,
      staffId,
    );

    res.status(201).json({
      success: true,
      message: "Delivery assigned successfully",
      data: assignment,
    });
  } catch (error: any) {
    if (error.message.includes("already assigned")) {
      return res.status(400).json({
        success: false,
        message: "Order is already assigned to a delivery staff member",
        data: null,
      });
    }
    throw error;
  }
};

/**
 * POST /api/admin/delivery/batch-assign
 * Admin bulk assigns multiple deliveries
 */
export const batchAssignDeliveries = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { assignments } = req.body;

    const results = await Promise.allSettled(
      assignments.map((a: any) =>
        DeliveryAssignmentService.assignOrder(a.orderId, a.staffId),
      ),
    );

    const successful = results
      .filter((r) => r.status === "fulfilled")
      .map((r: any) => r.value);
    const failed = results.filter((r) => r.status === "rejected");

    res.status(200).json({
      success: failed.length === 0,
      message: `${successful.length} assignments created${failed.length > 0 ? `, ${failed.length} failed` : ""}`,
      data: {
        successful,
        failedCount: failed.length,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/admin/delivery/reassign
 * Admin reassigns an order to a different staff member
 */
export const reassignDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId, newStaffId } = req.body;

    // Get current assignment
    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
        data: null,
      });
    }

    if (
      assignment.deliveryStatus === "DELIVERED" ||
      assignment.deliveryStatus === "FAILED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot reassign a completed delivery",
        data: null,
      });
    }

    // Update with new staff
    const updated = await prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data: {
        deliveryStaffId: newStaffId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Delivery reassigned successfully",
      data: updated,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/admin/delivery/assignments
 * List all delivery assignments with filters
 */
export const listAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { status, staffId, page = 1, limit = 20 } = req.query;

    const filters: any = {};
    if (status) filters.deliveryStatus = status;
    if (staffId) filters.deliveryStaffId = staffId;

    const skip = ((page as number) - 1) * (limit as number);

    const [assignments, total] = await Promise.all([
      prisma.deliveryAssignment.findMany({
        where: filters,
        skip,
        take: limit as number,
        orderBy: { createdAt: "desc" },
        include: { order: true, deliveryStaff: true },
      }),
      prisma.deliveryAssignment.count({ where: filters }),
    ]);

    res.status(200).json({
      success: true,
      message: "Assignments retrieved successfully",
      data: {
        assignments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / (limit as number)),
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/admin/delivery/assignments/:id
 * Get detailed assignment information
 */
export const getAssignmentDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id },
      include: { order: true, deliveryStaff: true, trackingPoints: true },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
        data: null,
      });
    }

    const metrics = await DeliveryMetricsService.getMetrics(
      assignment.deliveryStaffId,
    );

    res.status(200).json({
      success: true,
      message: "Assignment details retrieved",
      data: {
        assignment,
        metrics,
      },
    });
  } catch (error) {
    throw error;
  }
};
