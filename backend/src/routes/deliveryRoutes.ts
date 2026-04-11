import { Router, Request, Response, NextFunction } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { validateDelivery } from "../validators/deliveryValidator";
import * as delivery from "../validators/deliveryValidator";

// Controllers
import * as adminController from "../controllers/adminDeliveryController";
import * as staffController from "../controllers/deliveryStaffController";
import * as trackingController from "../controllers/trackingController";
import * as analyticsController from "../controllers/deliveryAnalyticsController";

const router = Router();

/**
 * Async error wrapper to catch and pass errors to error handler middleware
 */
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
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
router.post(
  "/admin/assign",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validateDelivery(delivery.validateAssignDelivery),
  asyncHandler(adminController.assignDeliveryToStaff),
);

/**
 * POST /api/delivery/admin/batch-assign
 * Bulk assign multiple delivery orders
 */
router.post(
  "/admin/batch-assign",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validateDelivery(delivery.validateBatchAssignDelivery),
  asyncHandler(adminController.batchAssignDeliveries),
);

/**
 * POST /api/delivery/admin/reassign
 * Reassign a delivery to a different staff member
 */
router.post(
  "/admin/reassign",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validateDelivery(delivery.validateReassignDelivery),
  asyncHandler(adminController.reassignDelivery),
);

/**
 * GET /api/delivery/admin/assignments
 * List delivery assignments with filters
 */
router.get(
  "/admin/assignments",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validateDelivery(delivery.validateListAssignments, "query"),
  asyncHandler(adminController.listAssignments),
);

/**
 * GET /api/delivery/admin/assignments/:id
 * Get detailed assignment information
 */
router.get(
  "/admin/assignments/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(adminController.getAssignmentDetails),
);

// ============================================================================
// DELIVERY STAFF ROUTES (PROTECTED - STAFF ROLE)
// ============================================================================

/**
 * GET /api/delivery/dashboard
 * Staff dashboard with metrics
 */
router.get(
  "/dashboard",
  authenticate,
  authorize("DELIVERY_STAFF"),
  asyncHandler(staffController.getDeliveryDashboard),
);

/**
 * GET /api/delivery/active-orders
 * Get list of active orders for this staff
 */
router.get(
  "/active-orders",
  authenticate,
  authorize("DELIVERY_STAFF"),
  validateDelivery(delivery.validateListActiveOrders, "query"),
  asyncHandler(staffController.getActiveOrders),
);

/**
 * POST /api/delivery/orders/:orderId/accept
 * Accept a delivery assignment
 */
router.post(
  "/orders/:orderId/accept",
  authenticate,
  authorize("DELIVERY_STAFF"),
  validateDelivery(delivery.validateAcceptDelivery),
  asyncHandler(staffController.acceptDelivery),
);

/**
 * POST /api/delivery/orders/:orderId/reject
 * Reject a delivery assignment
 */
router.post(
  "/orders/:orderId/reject",
  authenticate,
  authorize("DELIVERY_STAFF"),
  validateDelivery(delivery.validateRejectDelivery),
  asyncHandler(staffController.rejectDelivery),
);

/**
 * POST /api/delivery/location
 * Update current GPS location during delivery
 */
router.post(
  "/location",
  authenticate,
  authorize("DELIVERY_STAFF"),
  validateDelivery(delivery.validateUpdateLocation),
  asyncHandler(staffController.updateLocation),
);

/**
 * POST /api/delivery/orders/:orderId/pickup
 * Mark order as picked up
 */
router.post(
  "/orders/:orderId/pickup",
  authenticate,
  authorize("DELIVERY_STAFF"),
  validateDelivery(delivery.validateMarkPickup),
  asyncHandler(staffController.markPickup),
);

/**
 * POST /api/delivery/orders/:orderId/delivered
 * Mark order as delivered
 */
router.post(
  "/orders/:orderId/delivered",
  authenticate,
  authorize("DELIVERY_STAFF"),
  validateDelivery(delivery.validateMarkDelivered),
  asyncHandler(staffController.markDelivered),
);

/**
 * GET /api/delivery/earnings/today
 * Get today's earnings
 */
router.get(
  "/earnings/today",
  authenticate,
  authorize("DELIVERY_STAFF"),
  asyncHandler(staffController.getTodayEarnings),
);

/**
 * GET /api/delivery/metrics
 * Get staff performance metrics
 */
router.get(
  "/metrics",
  authenticate,
  authorize("DELIVERY_STAFF"),
  asyncHandler(staffController.getMetrics),
);

/**
 * POST /api/delivery/status/online
 * Update online/offline/break status
 */
router.post(
  "/status/update",
  authenticate,
  authorize("DELIVERY_STAFF"),
  validateDelivery(delivery.validateOnlineStatus),
  asyncHandler(staffController.setOnlineStatus),
);

/**
 * POST /api/delivery/orders/:orderId/feedback
 * Submit feedback after delivery
 */
router.post(
  "/orders/:orderId/feedback",
  authenticate,
  authorize("DELIVERY_STAFF"),
  asyncHandler(staffController.submitFeedback),
);

// ============================================================================
// CUSTOMER TRACKING ROUTES (PROTECTED - USER)
// ============================================================================

/**
 * GET /api/delivery/orders/:orderId/tracking
 * Get real-time tracking for an order
 */
router.get(
  "/orders/:orderId/tracking",
  authenticate,
  validateDelivery(delivery.validateOrderIdParam, "params"),
  asyncHandler(trackingController.getOrderTracking),
);

/**
 * GET /api/delivery/orders/:orderId/staff-info
 * Get delivery staff information
 */
router.get(
  "/orders/:orderId/staff-info",
  authenticate,
  validateDelivery(delivery.validateOrderIdParam, "params"),
  asyncHandler(trackingController.getDeliveryStaffInfo),
);

/**
 * POST /api/delivery/orders/:orderId/rate
 * Rate delivery and staff performance
 */
router.post(
  "/orders/:orderId/rate",
  authenticate,
  validateDelivery(delivery.validateOrderIdParam, "params"),
  validateDelivery(delivery.validateRateDelivery),
  asyncHandler(trackingController.rateDelivery),
);

// ============================================================================
// ANALYTICS ROUTES (PROTECTED - ADMIN ONLY)
// ============================================================================

/**
 * GET /api/delivery/admin/analytics/overview
 * Get comprehensive delivery analytics
 */
router.get(
  "/admin/analytics/overview",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validateDelivery(delivery.validateAnalyticsQuery, "query"),
  asyncHandler(analyticsController.getDeliveryOverview),
);

/**
 * GET /api/delivery/admin/analytics/by-staff
 * Get staff performance analytics
 */
router.get(
  "/admin/analytics/by-staff",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validateDelivery(delivery.validateAnalyticsQuery, "query"),
  asyncHandler(analyticsController.getStaffPerformance),
);

/**
 * GET /api/delivery/admin/analytics/heatmap
 * Get delivery density heatmap
 */
router.get(
  "/admin/analytics/heatmap",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validateDelivery(delivery.validateHeatmapQuery, "query"),
  asyncHandler(analyticsController.getDeliveryHeatmap),
);

/**
 * GET /api/delivery/admin/analytics/reports
 * Generate delivery reports
 */
router.get(
  "/admin/analytics/reports",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validateDelivery(delivery.validateReportQuery, "query"),
  asyncHandler(analyticsController.generateDeliveryReport),
);

export default router;
