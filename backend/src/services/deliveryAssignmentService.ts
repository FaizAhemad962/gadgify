// backend/src/services/deliveryAssignmentService.ts
import prisma from "../config/database";
import { logger } from "../config/logger";
import ConfigService from "./configService";
import { DeliveryAssignment, User } from "@prisma/client";

interface AssignmentStats {
  assignedAt: Date;
  acceptedAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
}

export class DeliveryAssignmentService {
  /**
   * Manually assign order to delivery staff (Admin/SuperAdmin)
   */
  static async assignOrder(
    orderId: string,
    deliveryStaffId: string,
  ): Promise<DeliveryAssignment> {
    try {
      // Verify both order and delivery staff exist
      const [order, staff] = await Promise.all([
        prisma.order.findUnique({ where: { id: orderId } }),
        prisma.user.findUnique({ where: { id: deliveryStaffId } }),
      ]);

      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      if (!staff || staff.role !== "DELIVERY_STAFF") {
        throw new Error(`Invalid delivery staff: ${deliveryStaffId}`);
      }

      // Check if order already assigned
      const existing = await prisma.deliveryAssignment.findUnique({
        where: { orderId },
      });

      if (existing && existing.assignmentStatus === "ACCEPTED") {
        throw new Error("Order is already assigned and accepted");
      }

      // Parse shipping address (stored as JSON string)
      const deliveryLocation = JSON.parse(order.shippingAddress);

      // Create or update assignment
      const assignment = await prisma.deliveryAssignment.upsert({
        where: { orderId },
        create: {
          orderId,
          deliveryStaffId,
          deliveryLocationJson: JSON.stringify(deliveryLocation),
          assignmentStatus: "ASSIGNED",
          deliveryStatus: "NOT_STARTED",
        },
        update: {
          deliveryStaffId,
          assignmentStatus: "ASSIGNED",
          assignedAt: new Date(),
          rejectedAt: null, // Clear any previous rejection
        },
      });

      logger.info(`Order ${orderId} assigned to staff ${deliveryStaffId}`);
      return assignment;
    } catch (error) {
      logger.error("Error assigning order:", error);
      throw error;
    }
  }

  /**
   * Auto-assign orders to available delivery staff
   * Uses location proximity, current load, and availability
   */
  static async autoAssignOrders(): Promise<DeliveryAssignment[]> {
    try {
      const autoAssignEnabled = await ConfigService.getConfig<boolean>(
        "auto_assign_enabled",
        false,
      );

      if (!autoAssignEnabled) {
        return [];
      }

      // Get unassigned orders
      const unassignedOrders = await prisma.order.findMany({
        where: {
          status: "CONFIRMED",
          deletedAt: null,
          deliveryAssignment: null,
        },
        include: { items: true, user: true },
        take: 50, // Batch process 50 orders at a time
      });

      if (unassignedOrders.length === 0) {
        return [];
      }

      // Get available delivery staff (online, with low load)
      const maxActiveDeliveries = await ConfigService.getConfig<number>(
        "auto_assign_max_active_deliveries",
        5,
      );

      const availableStaff = await prisma.user.findMany({
        where: {
          role: "DELIVERY_STAFF",
          deletedAt: null,
          deliveryMetrics: {
            isOnline: true,
          },
        },
        include: {
          deliveryMetrics: true,
          deliveryAssignments: {
            where: {
              deliveryStatus: {
                in: ["NOT_STARTED", "PICKED_UP", "IN_TRANSIT"],
              },
            },
          },
        },
      });

      // Filter staff with available capacity
      const capableStaff = availableStaff.filter(
        (staff) => staff.deliveryAssignments.length < maxActiveDeliveries,
      );

      if (capableStaff.length === 0) {
        logger.warn("No available delivery staff for auto-assignment");
        return [];
      }

      const maxDistance = await ConfigService.getConfig<number>(
        "auto_assign_max_distance_km",
        5,
      );

      const assignments: DeliveryAssignment[] = [];

      // Assign each order to closest available staff
      for (const order of unassignedOrders) {
        try {
          const bestStaff = this.findClosestStaff(
            order,
            capableStaff,
            maxDistance,
          );

          if (bestStaff) {
            const assignment = await this.assignOrder(order.id, bestStaff.id);
            assignments.push(assignment);

            // Reduce staff's capacity
            bestStaff.deliveryAssignments.push(assignment);
          }
        } catch (error) {
          logger.warn(`Failed to auto-assign order ${order.id}:`, error);
        }
      }

      logger.info(`Auto-assigned ${assignments.length} orders`);
      return assignments;
    } catch (error) {
      logger.error("Error in auto-assignment:", error);
      return [];
    }
  }

  /**
   * Find closest delivery staff to order location
   * In production, this would use actual geolocation calculations
   */
  private static findClosestStaff(
    order: any,
    staff: (User & { deliveryAssignments: DeliveryAssignment[] })[],
    maxDistance: number,
  ): (User & { deliveryAssignments: DeliveryAssignment[] }) | null {
    // TODO: Implement proper geolocation calculation
    // For now, just return least loaded staff
    return staff.reduce((closest, current) =>
      current.deliveryAssignments.length < closest.deliveryAssignments.length
        ? current
        : closest,
    );
  }

  /**
   * Delivery staff accepts order
   */
  static async acceptOrder(
    orderId: string,
    deliveryStaffId: string,
  ): Promise<DeliveryAssignment> {
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { orderId },
      });

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      if (assignment.deliveryStaffId !== deliveryStaffId) {
        throw new Error("Unauthorized");
      }

      const updated = await prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: {
          assignmentStatus: "ACCEPTED",
          deliveryStatus: "PICKED_UP",
          acceptedAt: new Date(),
        },
      });

      logger.info(`Order ${orderId} accepted by staff ${deliveryStaffId}`);
      return updated;
    } catch (error) {
      logger.error("Error accepting order:", error);
      throw error;
    }
  }

  /**
   * Delivery staff rejects order
   */
  static async rejectOrder(
    orderId: string,
    deliveryStaffId: string,
    reason: string,
  ): Promise<DeliveryAssignment> {
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { orderId },
      });

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      if (assignment.deliveryStaffId !== deliveryStaffId) {
        throw new Error("Unauthorized");
      }

      const updated = await prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: {
          assignmentStatus: "REJECTED",
          rejectedAt: new Date(),
          cancellationReason: reason,
          // Re-assign to another staff
          deliveryStaffId: null as any, // Will be handled by auto-assign
        },
      });

      logger.info(`Order ${orderId} rejected by staff ${deliveryStaffId}`);

      // Trigger auto-assignment for this order
      // TODO: Implement re-assignment logic

      return updated;
    } catch (error) {
      logger.error("Error rejecting order:", error);
      throw error;
    }
  }

  /**
   * Mark order as picked up from warehouse
   */
  static async markPickedUp(
    orderId: string,
    deliveryStaffId: string,
  ): Promise<DeliveryAssignment> {
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { orderId },
      });

      if (!assignment || assignment.deliveryStaffId !== deliveryStaffId) {
        throw new Error("Unauthorized");
      }

      const updated = await prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: {
          deliveryStatus: "PICKED_UP",
          collectedAt: new Date(),
        },
      });

      return updated;
    } catch (error) {
      logger.error("Error marking pickup:", error);
      throw error;
    }
  }

  /**
   * Mark order as in transit (left warehouse with customer)
   */
  static async markInTransit(
    orderId: string,
    deliveryStaffId: string,
  ): Promise<DeliveryAssignment> {
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { orderId },
      });

      if (!assignment || assignment.deliveryStaffId !== deliveryStaffId) {
        throw new Error("Unauthorized");
      }

      const updated = await prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: {
          deliveryStatus: "IN_TRANSIT",
          deliveryAt: new Date(),
        },
      });

      return updated;
    } catch (error) {
      logger.error("Error marking in transit:", error);
      throw error;
    }
  }

  /**
   * Mark order as delivered
   */
  static async markDelivered(
    orderId: string,
    deliveryStaffId: string,
    note?: string,
  ): Promise<DeliveryAssignment> {
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { orderId },
      });

      if (!assignment || assignment.deliveryStaffId !== deliveryStaffId) {
        throw new Error("Unauthorized");
      }

      const updated = await prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: {
          deliveryStatus: "DELIVERED",
          deliveryAt: new Date(),
          deliveryNote: note,
        },
      });

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "DELIVERED" },
      });

      logger.info(`Order ${orderId} delivered`);
      return updated;
    } catch (error) {
      logger.error("Error marking delivered:", error);
      throw error;
    }
  }

  /**
   * Mark delivery as failed
   */
  static async markFailed(
    orderId: string,
    deliveryStaffId: string,
    reason: string,
  ): Promise<DeliveryAssignment> {
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { orderId },
      });

      if (!assignment || assignment.deliveryStaffId !== deliveryStaffId) {
        throw new Error("Unauthorized");
      }

      const updated = await prisma.deliveryAssignment.update({
        where: { id: assignment.id },
        data: {
          deliveryStatus: "FAILED",
          failureReason: reason,
          deliveryAttempts: { increment: 1 },
        },
      });

      logger.info(`Order ${orderId} delivery failed: ${reason}`);
      return updated;
    } catch (error) {
      logger.error("Error marking failed:", error);
      throw error;
    }
  }

  /**
   * Get assignment by order ID
   */
  static async getAssignmentByOrder(
    orderId: string,
  ): Promise<DeliveryAssignment | null> {
    try {
      return await prisma.deliveryAssignment.findUnique({
        where: { orderId },
        include: {
          order: true,
          deliveryStaff: true,
          trackingPoints: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });
    } catch (error) {
      logger.error("Error getting assignment:", error);
      return null;
    }
  }

  /**
   * Get all active assignments for a delivery staff
   */
  static async getStaffActiveDeliveries(deliveryStaffId: string) {
    try {
      return await prisma.deliveryAssignment.findMany({
        where: {
          deliveryStaffId,
          deliveryStatus: { in: ["NOT_STARTED", "PICKED_UP", "IN_TRANSIT"] },
        },
        include: {
          order: true,
          trackingPoints: { take: 1, orderBy: { createdAt: "desc" } },
        },
        orderBy: { assignedAt: "asc" },
      });
    } catch (error) {
      logger.error("Error getting staff deliveries:", error);
      return [];
    }
  }
}

export default DeliveryAssignmentService;
