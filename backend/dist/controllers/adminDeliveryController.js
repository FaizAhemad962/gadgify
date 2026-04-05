"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignmentDetails = exports.listAssignments = exports.reassignDelivery = exports.batchAssignDeliveries = exports.assignDeliveryToStaff = void 0;
const database_1 = __importDefault(require("../config/database"));
const deliveryAssignmentService_1 = require("../services/deliveryAssignmentService");
const deliveryMetricsService_1 = require("../services/deliveryMetricsService");
/**
 * POST /api/admin/delivery/assign
 * Admin manually assigns a delivery order to a staff member
 */
const assignDeliveryToStaff = async (req, res) => {
    try {
        const { orderId, staffId } = req.body;
        const assignment = await deliveryAssignmentService_1.DeliveryAssignmentService.assignOrder(orderId, staffId);
        res.status(201).json({
            success: true,
            message: "Delivery assigned successfully",
            data: assignment,
        });
    }
    catch (error) {
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
exports.assignDeliveryToStaff = assignDeliveryToStaff;
/**
 * POST /api/admin/delivery/batch-assign
 * Admin bulk assigns multiple deliveries
 */
const batchAssignDeliveries = async (req, res) => {
    try {
        const { assignments } = req.body;
        const results = await Promise.allSettled(assignments.map((a) => deliveryAssignmentService_1.DeliveryAssignmentService.assignOrder(a.orderId, a.staffId)));
        const successful = results
            .filter((r) => r.status === "fulfilled")
            .map((r) => r.value);
        const failed = results.filter((r) => r.status === "rejected");
        res.status(200).json({
            success: failed.length === 0,
            message: `${successful.length} assignments created${failed.length > 0 ? `, ${failed.length} failed` : ""}`,
            data: {
                successful,
                failedCount: failed.length,
            },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.batchAssignDeliveries = batchAssignDeliveries;
/**
 * POST /api/admin/delivery/reassign
 * Admin reassigns an order to a different staff member
 */
const reassignDelivery = async (req, res) => {
    try {
        const { assignmentId, newStaffId } = req.body;
        // Get current assignment
        const assignment = await database_1.default.deliveryAssignment.findUnique({
            where: { id: assignmentId },
        });
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
                data: null,
            });
        }
        if (assignment.deliveryStatus === "DELIVERED" ||
            assignment.deliveryStatus === "FAILED") {
            return res.status(400).json({
                success: false,
                message: "Cannot reassign a completed delivery",
                data: null,
            });
        }
        // Update with new staff
        const updated = await database_1.default.deliveryAssignment.update({
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
    }
    catch (error) {
        throw error;
    }
};
exports.reassignDelivery = reassignDelivery;
/**
 * GET /api/admin/delivery/assignments
 * List all delivery assignments with filters
 */
const listAssignments = async (req, res) => {
    try {
        const { status, staffId, page = 1, limit = 20 } = req.query;
        const filters = {};
        if (status)
            filters.deliveryStatus = status;
        if (staffId)
            filters.deliveryStaffId = staffId;
        const skip = (page - 1) * limit;
        const [assignments, total] = await Promise.all([
            database_1.default.deliveryAssignment.findMany({
                where: filters,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: { order: true, deliveryStaff: true },
            }),
            database_1.default.deliveryAssignment.count({ where: filters }),
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
                    pages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.listAssignments = listAssignments;
/**
 * GET /api/admin/delivery/assignments/:id
 * Get detailed assignment information
 */
const getAssignmentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await database_1.default.deliveryAssignment.findUnique({
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
        const metrics = await deliveryMetricsService_1.DeliveryMetricsService.getMetrics(assignment.deliveryStaffId);
        res.status(200).json({
            success: true,
            message: "Assignment details retrieved",
            data: {
                assignment,
                metrics,
            },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getAssignmentDetails = getAssignmentDetails;
