"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateDelivery = exports.getDeliveryStaffInfo = exports.getOrderTracking = void 0;
const database_1 = __importDefault(require("../config/database"));
const deliveryTrackingService_1 = require("../services/deliveryTrackingService");
const deliveryMetricsService_1 = require("../services/deliveryMetricsService");
/**
 * GET /api/delivery/orders/:orderId/tracking
 * Get real-time tracking information for an order
 */
const getOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.params;
        const assignment = await database_1.default.deliveryAssignment.findUnique({
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
        const currentLocation = await deliveryTrackingService_1.DeliveryTrackingService.getCurrentLocation(assignment.id);
        // Estimate ETA if delivery is in progress
        let eta = null;
        if (assignment.deliveryStatus === "IN_TRANSIT") {
            eta = await deliveryTrackingService_1.DeliveryTrackingService.estimateETA(assignment.id);
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
    }
    catch (error) {
        throw error;
    }
};
exports.getOrderTracking = getOrderTracking;
/**
 * GET /api/delivery/orders/:orderId/staff-info
 * Get information about the assigned delivery staff
 */
const getDeliveryStaffInfo = async (req, res) => {
    try {
        const { orderId } = req.params;
        const assignment = await database_1.default.deliveryAssignment.findUnique({
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
        const metrics = await deliveryMetricsService_1.DeliveryMetricsService.getMetrics(assignment.deliveryStaffId);
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
    }
    catch (error) {
        throw error;
    }
};
exports.getDeliveryStaffInfo = getDeliveryStaffInfo;
/**
 * POST /api/delivery/orders/:orderId/rate
 * Customer rates the delivery and staff performance
 */
const rateDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { rating, review } = req.body;
        const assignment = await database_1.default.deliveryAssignment.findUnique({
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
        const updated = await deliveryMetricsService_1.DeliveryMetricsService.updateMetricsWithRating(assignment.deliveryStaffId, rating);
        res.status(201).json({
            success: true,
            message: "Rating submitted successfully",
            data: updated,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.rateDelivery = rateDelivery;
