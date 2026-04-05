"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryAssignmentService = void 0;
// backend/src/services/deliveryAssignmentService.ts
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../config/logger");
const configService_1 = __importDefault(require("./configService"));
class DeliveryAssignmentService {
    /**
     * Manually assign order to delivery staff (Admin/SuperAdmin)
     */
    static async assignOrder(orderId, deliveryStaffId) {
        try {
            // Verify both order and delivery staff exist
            const [order, staff] = await Promise.all([
                database_1.default.order.findUnique({ where: { id: orderId } }),
                database_1.default.user.findUnique({ where: { id: deliveryStaffId } }),
            ]);
            if (!order) {
                throw new Error(`Order not found: ${orderId}`);
            }
            if (!staff || staff.role !== "DELIVERY_STAFF") {
                throw new Error(`Invalid delivery staff: ${deliveryStaffId}`);
            }
            // Check if order already assigned
            const existing = await database_1.default.deliveryAssignment.findUnique({
                where: { orderId },
            });
            if (existing && existing.assignmentStatus === "ACCEPTED") {
                throw new Error("Order is already assigned and accepted");
            }
            // Parse shipping address (stored as JSON string)
            const deliveryLocation = JSON.parse(order.shippingAddress);
            // Create or update assignment
            const assignment = await database_1.default.deliveryAssignment.upsert({
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
            logger_1.logger.info(`Order ${orderId} assigned to staff ${deliveryStaffId}`);
            return assignment;
        }
        catch (error) {
            logger_1.logger.error("Error assigning order:", error);
            throw error;
        }
    }
    /**
     * Auto-assign orders to available delivery staff
     * Uses location proximity, current load, and availability
     */
    static async autoAssignOrders() {
        try {
            const autoAssignEnabled = await configService_1.default.getConfig("auto_assign_enabled", false);
            if (!autoAssignEnabled) {
                return [];
            }
            // Get unassigned orders
            const unassignedOrders = await database_1.default.order.findMany({
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
            const maxActiveDeliveries = await configService_1.default.getConfig("auto_assign_max_active_deliveries", 5);
            const availableStaff = await database_1.default.user.findMany({
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
            const capableStaff = availableStaff.filter((staff) => staff.deliveryAssignments.length < maxActiveDeliveries);
            if (capableStaff.length === 0) {
                logger_1.logger.warn("No available delivery staff for auto-assignment");
                return [];
            }
            const maxDistance = await configService_1.default.getConfig("auto_assign_max_distance_km", 5);
            const assignments = [];
            // Assign each order to closest available staff
            for (const order of unassignedOrders) {
                try {
                    const bestStaff = this.findClosestStaff(order, capableStaff, maxDistance);
                    if (bestStaff) {
                        const assignment = await this.assignOrder(order.id, bestStaff.id);
                        assignments.push(assignment);
                        // Reduce staff's capacity
                        bestStaff.deliveryAssignments.push(assignment);
                    }
                }
                catch (error) {
                    logger_1.logger.warn(`Failed to auto-assign order ${order.id}:`, error);
                }
            }
            logger_1.logger.info(`Auto-assigned ${assignments.length} orders`);
            return assignments;
        }
        catch (error) {
            logger_1.logger.error("Error in auto-assignment:", error);
            return [];
        }
    }
    /**
     * Find closest delivery staff to order location
     * In production, this would use actual geolocation calculations
     */
    static findClosestStaff(order, staff, maxDistance) {
        // TODO: Implement proper geolocation calculation
        // For now, just return least loaded staff
        return staff.reduce((closest, current) => current.deliveryAssignments.length < closest.deliveryAssignments.length
            ? current
            : closest);
    }
    /**
     * Delivery staff accepts order
     */
    static async acceptOrder(orderId, deliveryStaffId) {
        try {
            const assignment = await database_1.default.deliveryAssignment.findUnique({
                where: { orderId },
            });
            if (!assignment) {
                throw new Error("Assignment not found");
            }
            if (assignment.deliveryStaffId !== deliveryStaffId) {
                throw new Error("Unauthorized");
            }
            const updated = await database_1.default.deliveryAssignment.update({
                where: { id: assignment.id },
                data: {
                    assignmentStatus: "ACCEPTED",
                    deliveryStatus: "PICKED_UP",
                    acceptedAt: new Date(),
                },
            });
            logger_1.logger.info(`Order ${orderId} accepted by staff ${deliveryStaffId}`);
            return updated;
        }
        catch (error) {
            logger_1.logger.error("Error accepting order:", error);
            throw error;
        }
    }
    /**
     * Delivery staff rejects order
     */
    static async rejectOrder(orderId, deliveryStaffId, reason) {
        try {
            const assignment = await database_1.default.deliveryAssignment.findUnique({
                where: { orderId },
            });
            if (!assignment) {
                throw new Error("Assignment not found");
            }
            if (assignment.deliveryStaffId !== deliveryStaffId) {
                throw new Error("Unauthorized");
            }
            const updated = await database_1.default.deliveryAssignment.update({
                where: { id: assignment.id },
                data: {
                    assignmentStatus: "REJECTED",
                    rejectedAt: new Date(),
                    cancellationReason: reason,
                    // Re-assign to another staff
                    deliveryStaffId: null, // Will be handled by auto-assign
                },
            });
            logger_1.logger.info(`Order ${orderId} rejected by staff ${deliveryStaffId}`);
            // Trigger auto-assignment for this order
            // TODO: Implement re-assignment logic
            return updated;
        }
        catch (error) {
            logger_1.logger.error("Error rejecting order:", error);
            throw error;
        }
    }
    /**
     * Mark order as picked up from warehouse
     */
    static async markPickedUp(orderId, deliveryStaffId) {
        try {
            const assignment = await database_1.default.deliveryAssignment.findUnique({
                where: { orderId },
            });
            if (!assignment || assignment.deliveryStaffId !== deliveryStaffId) {
                throw new Error("Unauthorized");
            }
            const updated = await database_1.default.deliveryAssignment.update({
                where: { id: assignment.id },
                data: {
                    deliveryStatus: "PICKED_UP",
                    collectedAt: new Date(),
                },
            });
            return updated;
        }
        catch (error) {
            logger_1.logger.error("Error marking pickup:", error);
            throw error;
        }
    }
    /**
     * Mark order as in transit (left warehouse with customer)
     */
    static async markInTransit(orderId, deliveryStaffId) {
        try {
            const assignment = await database_1.default.deliveryAssignment.findUnique({
                where: { orderId },
            });
            if (!assignment || assignment.deliveryStaffId !== deliveryStaffId) {
                throw new Error("Unauthorized");
            }
            const updated = await database_1.default.deliveryAssignment.update({
                where: { id: assignment.id },
                data: {
                    deliveryStatus: "IN_TRANSIT",
                    deliveryAt: new Date(),
                },
            });
            return updated;
        }
        catch (error) {
            logger_1.logger.error("Error marking in transit:", error);
            throw error;
        }
    }
    /**
     * Mark order as delivered
     */
    static async markDelivered(orderId, deliveryStaffId, note) {
        try {
            const assignment = await database_1.default.deliveryAssignment.findUnique({
                where: { orderId },
            });
            if (!assignment || assignment.deliveryStaffId !== deliveryStaffId) {
                throw new Error("Unauthorized");
            }
            const updated = await database_1.default.deliveryAssignment.update({
                where: { id: assignment.id },
                data: {
                    deliveryStatus: "DELIVERED",
                    deliveryAt: new Date(),
                    deliveryNote: note,
                },
            });
            // Update order status
            await database_1.default.order.update({
                where: { id: orderId },
                data: { status: "DELIVERED" },
            });
            logger_1.logger.info(`Order ${orderId} delivered`);
            return updated;
        }
        catch (error) {
            logger_1.logger.error("Error marking delivered:", error);
            throw error;
        }
    }
    /**
     * Mark delivery as failed
     */
    static async markFailed(orderId, deliveryStaffId, reason) {
        try {
            const assignment = await database_1.default.deliveryAssignment.findUnique({
                where: { orderId },
            });
            if (!assignment || assignment.deliveryStaffId !== deliveryStaffId) {
                throw new Error("Unauthorized");
            }
            const updated = await database_1.default.deliveryAssignment.update({
                where: { id: assignment.id },
                data: {
                    deliveryStatus: "FAILED",
                    failureReason: reason,
                    deliveryAttempts: { increment: 1 },
                },
            });
            logger_1.logger.info(`Order ${orderId} delivery failed: ${reason}`);
            return updated;
        }
        catch (error) {
            logger_1.logger.error("Error marking failed:", error);
            throw error;
        }
    }
    /**
     * Get assignment by order ID
     */
    static async getAssignmentByOrder(orderId) {
        try {
            return await database_1.default.deliveryAssignment.findUnique({
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
        }
        catch (error) {
            logger_1.logger.error("Error getting assignment:", error);
            return null;
        }
    }
    /**
     * Get all active assignments for a delivery staff
     */
    static async getStaffActiveDeliveries(deliveryStaffId) {
        try {
            return await database_1.default.deliveryAssignment.findMany({
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
        }
        catch (error) {
            logger_1.logger.error("Error getting staff deliveries:", error);
            return [];
        }
    }
}
exports.DeliveryAssignmentService = DeliveryAssignmentService;
exports.default = DeliveryAssignmentService;
