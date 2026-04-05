"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFeedback = exports.setOnlineStatus = exports.getMetrics = exports.getTodayEarnings = exports.markDelivered = exports.markPickup = exports.updateLocation = exports.rejectDelivery = exports.acceptDelivery = exports.getActiveOrders = exports.getDeliveryDashboard = void 0;
const database_1 = __importDefault(require("../config/database"));
const deliveryAssignmentService_1 = require("../services/deliveryAssignmentService");
const deliveryTrackingService_1 = require("../services/deliveryTrackingService");
const deliveryMetricsService_1 = require("../services/deliveryMetricsService");
const deliveryEarningsService_1 = require("../services/deliveryEarningsService");
/**
 * GET /api/delivery/dashboard
 * Staff member's dashboard with key metrics
 */
const getDeliveryDashboard = async (req, res) => {
    try {
        const staffId = req.user?.id;
        const metrics = await deliveryMetricsService_1.DeliveryMetricsService.getMetrics(staffId);
        const todayEarnings = await deliveryEarningsService_1.DeliveryEarningsService.getTodayEarnings(staffId);
        const activeDeliveries = await deliveryAssignmentService_1.DeliveryAssignmentService.getStaffActiveDeliveries(staffId);
        res.status(200).json({
            success: true,
            message: "Dashboard data retrieved",
            data: {
                earnings: todayEarnings,
                metrics,
                activeDeliveries: activeDeliveries.length,
            },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getDeliveryDashboard = getDeliveryDashboard;
/**
 * GET /api/delivery/active-orders
 * Get list of active orders assigned to staff
 */
const getActiveOrders = async (req, res) => {
    try {
        const staffId = req.user?.id;
        const activeDeliveries = await deliveryAssignmentService_1.DeliveryAssignmentService.getStaffActiveDeliveries(staffId);
        res.status(200).json({
            success: true,
            message: "Active orders retrieved",
            data: activeDeliveries,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getActiveOrders = getActiveOrders;
/**
 * POST /api/delivery/orders/:orderId/accept
 * Staff member accepts a delivery assignment
 */
const acceptDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;
        const staffId = req.user?.id;
        const assignment = await deliveryAssignmentService_1.DeliveryAssignmentService.acceptOrder(orderId, staffId);
        res.status(200).json({
            success: true,
            message: "Delivery accepted",
            data: assignment,
        });
    }
    catch (error) {
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
exports.acceptDelivery = acceptDelivery;
/**
 * POST /api/delivery/orders/:orderId/reject
 * Staff member rejects a delivery assignment
 */
const rejectDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        const staffId = req.user?.id;
        const assignment = await deliveryAssignmentService_1.DeliveryAssignmentService.rejectOrder(orderId, staffId, reason);
        res.status(200).json({
            success: true,
            message: "Delivery rejected",
            data: assignment,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.rejectDelivery = rejectDelivery;
/**
 * POST /api/delivery/location
 * Update current GPS location
 */
const updateLocation = async (req, res) => {
    try {
        const { coordinates, assignmentId } = req.body;
        const staffId = req.user?.id;
        const tracking = await deliveryTrackingService_1.DeliveryTrackingService.updateLocation(assignmentId, staffId, { latitude: coordinates.latitude, longitude: coordinates.longitude });
        res.status(200).json({
            success: true,
            message: "Location updated",
            data: tracking,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.updateLocation = updateLocation;
/**
 * POST /api/delivery/orders/:orderId/pickup
 * Mark order as picked up
 */
const markPickup = async (req, res) => {
    try {
        const { orderId } = req.params;
        const staffId = req.user?.id;
        const assignment = await deliveryAssignmentService_1.DeliveryAssignmentService.markPickedUp(orderId, staffId);
        res.status(200).json({
            success: true,
            message: "Marked as picked up",
            data: assignment,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.markPickup = markPickup;
/**
 * POST /api/delivery/orders/:orderId/delivered
 * Mark order as delivered
 */
const markDelivered = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { note } = req.body;
        const staffId = req.user?.id;
        const assignment = await deliveryAssignmentService_1.DeliveryAssignmentService.markDelivered(orderId, staffId, note);
        // Get assignment details for earnings calculation
        const assignmentData = await database_1.default.deliveryAssignment.findUnique({
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
                deductions: deductionAmount > 0 ? [`Deduction: Rs ${deductionAmount}`] : [],
            },
        };
        const earning = await deliveryEarningsService_1.DeliveryEarningsService.recordDeliveryEarnings(assignmentData.id, staffId, earningsBreakdown);
        res.status(200).json({
            success: true,
            message: "Marked as delivered",
            data: {
                assignment,
                earning,
            },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.markDelivered = markDelivered;
/**
 * GET /api/delivery/earnings/today
 * Get today's earnings
 */
const getTodayEarnings = async (req, res) => {
    try {
        const staffId = req.user?.id;
        const earnings = await deliveryEarningsService_1.DeliveryEarningsService.getTodayEarnings(staffId);
        res.status(200).json({
            success: true,
            message: "Earnings retrieved",
            data: earnings,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getTodayEarnings = getTodayEarnings;
/**
 * GET /api/delivery/metrics
 * Get staff performance metrics
 */
const getMetrics = async (req, res) => {
    try {
        const staffId = req.user?.id;
        const metrics = await deliveryMetricsService_1.DeliveryMetricsService.getMetrics(staffId);
        res.status(200).json({
            success: true,
            message: "Metrics retrieved",
            data: metrics,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getMetrics = getMetrics;
/**
 * POST /api/delivery/status/online
 * Set availability status
 */
const setOnlineStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const staffId = req.user?.id;
        if (status === "ONLINE") {
            await deliveryMetricsService_1.DeliveryMetricsService.goOnline(staffId);
        }
        else if (status === "OFFLINE") {
            await deliveryMetricsService_1.DeliveryMetricsService.goOffline(staffId);
        }
        res.status(200).json({
            success: true,
            message: `Status updated to ${status}`,
            data: null,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.setOnlineStatus = setOnlineStatus;
/**
 * POST /api/delivery/orders/:orderId/feedback
 * Submit feedback after delivery
 */
const submitFeedback = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Feedback submitted",
            data: null,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.submitFeedback = submitFeedback;
