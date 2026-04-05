"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDelivery = exports.validateReportQuery = exports.validateHeatmapQuery = exports.validateAnalyticsQuery = exports.validateRateDelivery = exports.validateOrderIdParam = exports.validateEarningsQuery = exports.validateListActiveOrders = exports.validateAddRating = exports.validateOnlineStatus = exports.validateMarkDelivered = exports.validateMarkPickup = exports.validateUpdateLocation = exports.validateRejectDelivery = exports.validateAcceptDelivery = exports.validateListAssignments = exports.validateReassignDelivery = exports.validateBatchAssignDelivery = exports.validateAssignDelivery = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * Joi schema validators for delivery system endpoints
 * All schemas are exported as middleware-ready functions
 */
// Common validations
const mongoIdSchema = joi_1.default.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
    "string.pattern.base": "Invalid MongoDB ID format",
});
const coordinatesSchema = joi_1.default.object({
    latitude: joi_1.default.number().min(-90).max(90).required(),
    longitude: joi_1.default.number().min(-180).max(180).required(),
}).required();
// ============================================================================
// ADMIN DELIVERY VALIDATORS
// ============================================================================
exports.validateAssignDelivery = joi_1.default.object({
    orderId: mongoIdSchema,
    staffId: mongoIdSchema,
    priorityLevel: joi_1.default.string()
        .valid("LOW", "MEDIUM", "HIGH", "URGENT")
        .default("MEDIUM"),
    estimatedDeliveryTime: joi_1.default.number().min(15).max(1440).messages({
        "number.base": "Estimated delivery time must be in minutes",
        "number.min": "Minimum 15 minutes",
        "number.max": "Maximum 1440 minutes (24 hours)",
    }),
    notes: joi_1.default.string().max(500),
}).required();
exports.validateBatchAssignDelivery = joi_1.default.object({
    assignments: joi_1.default.array()
        .items(joi_1.default.object({
        orderId: mongoIdSchema,
        staffId: mongoIdSchema,
        priorityLevel: joi_1.default.string()
            .valid("LOW", "MEDIUM", "HIGH", "URGENT")
            .default("MEDIUM"),
        estimatedDeliveryTime: joi_1.default.number().min(15).max(1440),
        notes: joi_1.default.string().max(500),
    }))
        .min(1)
        .max(100)
        .required(),
}).required();
exports.validateReassignDelivery = joi_1.default.object({
    assignmentId: mongoIdSchema,
    newStaffId: mongoIdSchema,
    reason: joi_1.default.string()
        .valid("PERFORMANCE", "LOCATION", "CAPACITY", "SAFETY", "OTHER")
        .required(),
    notes: joi_1.default.string().max(500),
}).required();
exports.validateListAssignments = joi_1.default.object({
    status: joi_1.default.string().valid("PENDING", "IN_PROGRESS", "COMPLETED", "FAILED", "CANCELLED"),
    staffId: joi_1.default.string().regex(/^[0-9a-fA-F]{24}$/),
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(10).max(100).default(20),
    sortBy: joi_1.default.string()
        .valid("createdAt", "priority", "estimatedTime")
        .default("createdAt"),
}).unknown(true);
// ============================================================================
// DELIVERY STAFF VALIDATORS
// ============================================================================
exports.validateAcceptDelivery = joi_1.default.object({
    estimatedArrivalTime: joi_1.default.number().min(5).max(60).required().messages({
        "number.base": "ETA must be in minutes",
    }),
    pickupLocation: coordinatesSchema.required(),
    notes: joi_1.default.string().max(500),
}).required();
exports.validateRejectDelivery = joi_1.default.object({
    reason: joi_1.default.string()
        .valid("TOO_FAR", "TRAFFIC", "UNAVAILABLE", "SAFETY_CONCERN", "OTHER")
        .required(),
    notes: joi_1.default.string().max(500),
}).required();
exports.validateUpdateLocation = joi_1.default.object({
    coordinates: coordinatesSchema,
    accuracy: joi_1.default.number().min(0).max(100),
    speed: joi_1.default.number().min(0),
    heading: joi_1.default.number().min(0).max(360),
    timestamp: joi_1.default.number().integer(),
}).required();
exports.validateMarkPickup = joi_1.default.object({
    pickupTime: joi_1.default.date().required(),
    pickupPhotos: joi_1.default.array().items(joi_1.default.string().uri()).max(5),
    notes: joi_1.default.string().max(500),
}).required();
exports.validateMarkDelivered = joi_1.default.object({
    deliveredTime: joi_1.default.date().required(),
    deliveryPhotos: joi_1.default.array().items(joi_1.default.string().uri()).max(5).required(),
    recipientName: joi_1.default.string().max(100).required(),
    signature: joi_1.default.string().uri(),
    notes: joi_1.default.string().max(500),
    otp: joi_1.default.string().length(6).pattern(/^\d+$/),
}).required();
exports.validateOnlineStatus = joi_1.default.object({
    status: joi_1.default.string().valid("ONLINE", "OFFLINE", "ON_BREAK").required(),
    breakReason: joi_1.default.string().when("status", {
        is: "ON_BREAK",
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional(),
    }),
    breakDuration: joi_1.default.number().integer().min(5).when("status", {
        is: "ON_BREAK",
        then: joi_1.default.required(),
        otherwise: joi_1.default.optional(),
    }),
}).required();
exports.validateAddRating = joi_1.default.object({
    rating: joi_1.default.number().min(1).max(5).integer().required(),
    review: joi_1.default.string().max(500),
    aspectRatings: joi_1.default.object({
        professionalism: joi_1.default.number().min(1).max(5),
        punctuality: joi_1.default.number().min(1).max(5),
        communication: joi_1.default.number().min(1).max(5),
        packaging: joi_1.default.number().min(1).max(5),
    }),
}).required();
exports.validateListActiveOrders = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(5).max(50).default(10),
    filterBy: joi_1.default.string()
        .valid("PENDING_ACCEPTANCE", "IN_PROGRESS", "NEAR_DESTINATION")
        .default("IN_PROGRESS"),
}).unknown(true);
exports.validateEarningsQuery = joi_1.default.object({
    startDate: joi_1.default.date(),
    endDate: joi_1.default.date(),
    period: joi_1.default.string()
        .valid("TODAY", "WEEK", "MONTH", "CUSTOM")
        .default("TODAY"),
}).unknown(true);
// ============================================================================
// CUSTOMER TRACKING VALIDATORS
// ============================================================================
exports.validateOrderIdParam = joi_1.default.object({
    orderId: mongoIdSchema,
}).required();
exports.validateRateDelivery = joi_1.default.object({
    rating: joi_1.default.number().min(1).max(5).integer().required(),
    review: joi_1.default.string().max(500),
    aspectRatings: joi_1.default.object({
        professionalism: joi_1.default.number().min(1).max(5),
        punctuality: joi_1.default.number().min(1).max(5),
        communication: joi_1.default.number().min(1).max(5),
        packaging: joi_1.default.number().min(1).max(5),
    }),
}).required();
// ============================================================================
// ANALYTICS VALIDATORS
// ============================================================================
exports.validateAnalyticsQuery = joi_1.default.object({
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().required(),
    groupBy: joi_1.default.string().valid("HOURLY", "DAILY", "WEEKLY").default("DAILY"),
    staffId: joi_1.default.string().regex(/^[0-9a-fA-F]{24}$/),
}).unknown(true);
exports.validateHeatmapQuery = joi_1.default.object({
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().required(),
    radius: joi_1.default.number().min(0.1).max(50).default(1),
    gridSize: joi_1.default.number().integer().min(5).max(100).default(20),
}).unknown(true);
exports.validateReportQuery = joi_1.default.object({
    startDate: joi_1.default.date().required(),
    endDate: joi_1.default.date().required(),
    reportType: joi_1.default.string()
        .valid("COMPREHENSIVE", "STAFF_PERFORMANCE", "CUSTOMER_SATISFACTION", "OPERATIONAL")
        .default("COMPREHENSIVE"),
    format: joi_1.default.string().valid("JSON", "CSV", "PDF").default("JSON"),
}).unknown(true);
// ============================================================================
// MIDDLEWARE GENERATORS
// ============================================================================
/**
 * Validate request body, params, or query
 */
const validateDelivery = (schema, source = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const message = error.details.map((d) => d.message).join(", ");
            return res.status(400).json({
                success: false,
                message: `Validation Error: ${message}`,
                data: null,
            });
        }
        req[source] = value;
        next();
    };
};
exports.validateDelivery = validateDelivery;
