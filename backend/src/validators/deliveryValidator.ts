import Joi from "joi";

/**
 * Joi schema validators for delivery system endpoints
 * All schemas are exported as middleware-ready functions
 */

// Common validations
const mongoIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    "string.pattern.base": "Invalid MongoDB ID format",
  });

const coordinatesSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
}).required();

// ============================================================================
// ADMIN DELIVERY VALIDATORS
// ============================================================================

export const validateAssignDelivery = Joi.object({
  orderId: mongoIdSchema,
  staffId: mongoIdSchema,
  priorityLevel: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH", "URGENT")
    .default("MEDIUM"),
  estimatedDeliveryTime: Joi.number().min(15).max(1440).messages({
    "number.base": "Estimated delivery time must be in minutes",
    "number.min": "Minimum 15 minutes",
    "number.max": "Maximum 1440 minutes (24 hours)",
  }),
  notes: Joi.string().max(500),
}).required();

export const validateBatchAssignDelivery = Joi.object({
  assignments: Joi.array()
    .items(
      Joi.object({
        orderId: mongoIdSchema,
        staffId: mongoIdSchema,
        priorityLevel: Joi.string()
          .valid("LOW", "MEDIUM", "HIGH", "URGENT")
          .default("MEDIUM"),
        estimatedDeliveryTime: Joi.number().min(15).max(1440),
        notes: Joi.string().max(500),
      }),
    )
    .min(1)
    .max(100)
    .required(),
}).required();

export const validateReassignDelivery = Joi.object({
  assignmentId: mongoIdSchema,
  newStaffId: mongoIdSchema,
  reason: Joi.string()
    .valid("PERFORMANCE", "LOCATION", "CAPACITY", "SAFETY", "OTHER")
    .required(),
  notes: Joi.string().max(500),
}).required();

export const validateListAssignments = Joi.object({
  status: Joi.string().valid(
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
  ),
  staffId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(10).max(100).default(20),
  sortBy: Joi.string()
    .valid("createdAt", "priority", "estimatedTime")
    .default("createdAt"),
}).unknown(true);

// ============================================================================
// DELIVERY STAFF VALIDATORS
// ============================================================================

export const validateAcceptDelivery = Joi.object({
  estimatedArrivalTime: Joi.number().min(5).max(60).required().messages({
    "number.base": "ETA must be in minutes",
  }),
  pickupLocation: coordinatesSchema.required(),
  notes: Joi.string().max(500),
}).required();

export const validateRejectDelivery = Joi.object({
  reason: Joi.string()
    .valid("TOO_FAR", "TRAFFIC", "UNAVAILABLE", "SAFETY_CONCERN", "OTHER")
    .required(),
  notes: Joi.string().max(500),
}).required();

export const validateUpdateLocation = Joi.object({
  coordinates: coordinatesSchema,
  accuracy: Joi.number().min(0).max(100),
  speed: Joi.number().min(0),
  heading: Joi.number().min(0).max(360),
  timestamp: Joi.number().integer(),
}).required();

export const validateMarkPickup = Joi.object({
  pickupTime: Joi.date().required(),
  pickupPhotos: Joi.array().items(Joi.string().uri()).max(5),
  notes: Joi.string().max(500),
}).required();

export const validateMarkDelivered = Joi.object({
  deliveredTime: Joi.date().required(),
  deliveryPhotos: Joi.array().items(Joi.string().uri()).max(5).required(),
  recipientName: Joi.string().max(100).required(),
  signature: Joi.string().uri(),
  notes: Joi.string().max(500),
  otp: Joi.string().length(6).pattern(/^\d+$/),
}).required();

export const validateOnlineStatus = Joi.object({
  status: Joi.string().valid("ONLINE", "OFFLINE", "ON_BREAK").required(),
  breakReason: Joi.string().when("status", {
    is: "ON_BREAK",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  breakDuration: Joi.number().integer().min(5).when("status", {
    is: "ON_BREAK",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
}).required();

export const validateAddRating = Joi.object({
  rating: Joi.number().min(1).max(5).integer().required(),
  review: Joi.string().max(500),
  aspectRatings: Joi.object({
    professionalism: Joi.number().min(1).max(5),
    punctuality: Joi.number().min(1).max(5),
    communication: Joi.number().min(1).max(5),
    packaging: Joi.number().min(1).max(5),
  }),
}).required();

export const validateListActiveOrders = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(5).max(50).default(10),
  filterBy: Joi.string()
    .valid("PENDING_ACCEPTANCE", "IN_PROGRESS", "NEAR_DESTINATION")
    .default("IN_PROGRESS"),
}).unknown(true);

export const validateEarningsQuery = Joi.object({
  startDate: Joi.date(),
  endDate: Joi.date(),
  period: Joi.string()
    .valid("TODAY", "WEEK", "MONTH", "CUSTOM")
    .default("TODAY"),
}).unknown(true);

// ============================================================================
// CUSTOMER TRACKING VALIDATORS
// ============================================================================

export const validateOrderIdParam = Joi.object({
  orderId: mongoIdSchema,
}).required();

export const validateRateDelivery = Joi.object({
  rating: Joi.number().min(1).max(5).integer().required(),
  review: Joi.string().max(500),
  aspectRatings: Joi.object({
    professionalism: Joi.number().min(1).max(5),
    punctuality: Joi.number().min(1).max(5),
    communication: Joi.number().min(1).max(5),
    packaging: Joi.number().min(1).max(5),
  }),
}).required();

// ============================================================================
// ANALYTICS VALIDATORS
// ============================================================================

export const validateAnalyticsQuery = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  groupBy: Joi.string().valid("HOURLY", "DAILY", "WEEKLY").default("DAILY"),
  staffId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
}).unknown(true);

export const validateHeatmapQuery = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  radius: Joi.number().min(0.1).max(50).default(1),
  gridSize: Joi.number().integer().min(5).max(100).default(20),
}).unknown(true);

export const validateReportQuery = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  reportType: Joi.string()
    .valid(
      "COMPREHENSIVE",
      "STAFF_PERFORMANCE",
      "CUSTOMER_SATISFACTION",
      "OPERATIONAL",
    )
    .default("COMPREHENSIVE"),
  format: Joi.string().valid("JSON", "CSV", "PDF").default("JSON"),
}).unknown(true);

// ============================================================================
// MIDDLEWARE GENERATORS
// ============================================================================

/**
 * Validate request body, params, or query
 */
export const validateDelivery = (
  schema: Joi.ObjectSchema | Joi.ArraySchema,
  source = "body",
) => {
  return (req: any, res: any, next: any) => {
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
