import express from "express";
import {
  getAllFlashSales,
  getFlashSaleById,
  getUpcomingFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
} from "../controllers/flashSaleController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import Joi from "joi";

const router = express.Router();

// Validation schemas
const createFlashSaleSchema = Joi.object({
  productId: Joi.string(),
  title: Joi.string()
    .required()
    .messages({ "any.required": "Title is required" }),
  description: Joi.string(),
  discountPercentage: Joi.number().min(0).max(100).required(),
  maxDiscount: Joi.number().min(0),
  startTime: Joi.date()
    .required()
    .messages({ "any.required": "Start time is required" }),
  endTime: Joi.date().required().greater(Joi.ref("startTime")).messages({
    "date.greater": "End time must be after start time",
    "any.required": "End time is required",
  }),
});

const updateFlashSaleSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  discountPercentage: Joi.number().min(0).max(100),
  maxDiscount: Joi.number().min(0),
  startTime: Joi.date(),
  endTime: Joi.date(),
  isActive: Joi.boolean(),
});

// Public routes
router.get("/", getAllFlashSales);
router.get("/upcoming", getUpcomingFlashSales);
router.get("/:id", getFlashSaleById);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(createFlashSaleSchema),
  createFlashSale,
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(updateFlashSaleSchema),
  updateFlashSale,
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteFlashSale,
);

export default router;
