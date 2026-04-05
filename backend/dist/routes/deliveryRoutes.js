"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const deliveryValidator_1 = require("../validators/deliveryValidator");
const delivery = __importStar(require("../validators/deliveryValidator"));
// Controllers
const adminController = __importStar(require("../controllers/adminDeliveryController"));
const staffController = __importStar(require("../controllers/deliveryStaffController"));
const trackingController = __importStar(require("../controllers/trackingController"));
const analyticsController = __importStar(require("../controllers/deliveryAnalyticsController"));
const router = (0, express_1.Router)();
/**
 * Async error wrapper to catch and pass errors to error handler middleware
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// ============================================================================
// ADMIN DELIVERY ROUTES (PROTECTED - ADMIN ONLY)
// ============================================================================
/**
 * POST /api/delivery/admin/assign
 * Manually assign a delivery order to a staff member
 */
router.post("/admin/assign", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, deliveryValidator_1.validateDelivery)(delivery.validateAssignDelivery), asyncHandler(adminController.assignDeliveryToStaff));
/**
 * POST /api/delivery/admin/batch-assign
 * Bulk assign multiple delivery orders
 */
router.post("/admin/batch-assign", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, deliveryValidator_1.validateDelivery)(delivery.validateBatchAssignDelivery), asyncHandler(adminController.batchAssignDeliveries));
/**
 * POST /api/delivery/admin/reassign
 * Reassign a delivery to a different staff member
 */
router.post("/admin/reassign", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, deliveryValidator_1.validateDelivery)(delivery.validateReassignDelivery), asyncHandler(adminController.reassignDelivery));
/**
 * GET /api/delivery/admin/assignments
 * List delivery assignments with filters
 */
router.get("/admin/assignments", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, deliveryValidator_1.validateDelivery)(delivery.validateListAssignments, "query"), asyncHandler(adminController.listAssignments));
/**
 * GET /api/delivery/admin/assignments/:id
 * Get detailed assignment information
 */
router.get("/admin/assignments/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), asyncHandler(adminController.getAssignmentDetails));
// ============================================================================
// DELIVERY STAFF ROUTES (PROTECTED - STAFF ROLE)
// ============================================================================
/**
 * GET /api/delivery/dashboard
 * Staff dashboard with metrics
 */
router.get("/dashboard", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), asyncHandler(staffController.getDeliveryDashboard));
/**
 * GET /api/delivery/active-orders
 * Get list of active orders for this staff
 */
router.get("/active-orders", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), (0, deliveryValidator_1.validateDelivery)(delivery.validateListActiveOrders, "query"), asyncHandler(staffController.getActiveOrders));
/**
 * POST /api/delivery/orders/:orderId/accept
 * Accept a delivery assignment
 */
router.post("/orders/:orderId/accept", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), (0, deliveryValidator_1.validateDelivery)(delivery.validateAcceptDelivery), asyncHandler(staffController.acceptDelivery));
/**
 * POST /api/delivery/orders/:orderId/reject
 * Reject a delivery assignment
 */
router.post("/orders/:orderId/reject", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), (0, deliveryValidator_1.validateDelivery)(delivery.validateRejectDelivery), asyncHandler(staffController.rejectDelivery));
/**
 * POST /api/delivery/location
 * Update current GPS location during delivery
 */
router.post("/location", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), (0, deliveryValidator_1.validateDelivery)(delivery.validateUpdateLocation), asyncHandler(staffController.updateLocation));
/**
 * POST /api/delivery/orders/:orderId/pickup
 * Mark order as picked up
 */
router.post("/orders/:orderId/pickup", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), (0, deliveryValidator_1.validateDelivery)(delivery.validateMarkPickup), asyncHandler(staffController.markPickup));
/**
 * POST /api/delivery/orders/:orderId/delivered
 * Mark order as delivered
 */
router.post("/orders/:orderId/delivered", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), (0, deliveryValidator_1.validateDelivery)(delivery.validateMarkDelivered), asyncHandler(staffController.markDelivered));
/**
 * GET /api/delivery/earnings/today
 * Get today's earnings
 */
router.get("/earnings/today", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), asyncHandler(staffController.getTodayEarnings));
/**
 * GET /api/delivery/metrics
 * Get staff performance metrics
 */
router.get("/metrics", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), asyncHandler(staffController.getMetrics));
/**
 * POST /api/delivery/status/online
 * Update online/offline/break status
 */
router.post("/status/update", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), (0, deliveryValidator_1.validateDelivery)(delivery.validateOnlineStatus), asyncHandler(staffController.setOnlineStatus));
/**
 * POST /api/delivery/orders/:orderId/feedback
 * Submit feedback after delivery
 */
router.post("/orders/:orderId/feedback", auth_1.authenticate, (0, auth_1.authorize)("DELIVERY_STAFF"), asyncHandler(staffController.submitFeedback));
// ============================================================================
// CUSTOMER TRACKING ROUTES (PROTECTED - USER)
// ============================================================================
/**
 * GET /api/delivery/orders/:orderId/tracking
 * Get real-time tracking for an order
 */
router.get("/orders/:orderId/tracking", auth_1.authenticate, (0, deliveryValidator_1.validateDelivery)(delivery.validateOrderIdParam, "params"), asyncHandler(trackingController.getOrderTracking));
/**
 * GET /api/delivery/orders/:orderId/staff-info
 * Get delivery staff information
 */
router.get("/orders/:orderId/staff-info", auth_1.authenticate, (0, deliveryValidator_1.validateDelivery)(delivery.validateOrderIdParam, "params"), asyncHandler(trackingController.getDeliveryStaffInfo));
/**
 * POST /api/delivery/orders/:orderId/rate
 * Rate delivery and staff performance
 */
router.post("/orders/:orderId/rate", auth_1.authenticate, (0, deliveryValidator_1.validateDelivery)(delivery.validateOrderIdParam, "params"), (0, deliveryValidator_1.validateDelivery)(delivery.validateRateDelivery), asyncHandler(trackingController.rateDelivery));
// ============================================================================
// ANALYTICS ROUTES (PROTECTED - ADMIN ONLY)
// ============================================================================
/**
 * GET /api/delivery/admin/analytics/overview
 * Get comprehensive delivery analytics
 */
router.get("/admin/analytics/overview", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, deliveryValidator_1.validateDelivery)(delivery.validateAnalyticsQuery, "query"), asyncHandler(analyticsController.getDeliveryOverview));
/**
 * GET /api/delivery/admin/analytics/by-staff
 * Get staff performance analytics
 */
router.get("/admin/analytics/by-staff", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, deliveryValidator_1.validateDelivery)(delivery.validateAnalyticsQuery, "query"), asyncHandler(analyticsController.getStaffPerformance));
/**
 * GET /api/delivery/admin/analytics/heatmap
 * Get delivery density heatmap
 */
router.get("/admin/analytics/heatmap", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, deliveryValidator_1.validateDelivery)(delivery.validateHeatmapQuery, "query"), asyncHandler(analyticsController.getDeliveryHeatmap));
/**
 * GET /api/delivery/admin/analytics/reports
 * Generate delivery reports
 */
router.get("/admin/analytics/reports", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, deliveryValidator_1.validateDelivery)(delivery.validateReportQuery, "query"), asyncHandler(analyticsController.generateDeliveryReport));
exports.default = router;
