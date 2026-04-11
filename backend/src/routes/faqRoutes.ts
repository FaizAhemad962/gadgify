import express from "express";
import {
  getAllFAQs,
  getFAQCategories,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  incrementFAQViews,
} from "../controllers/faqController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import Joi from "joi";

const router = express.Router();

// Validation schemas
const createFAQSchema = Joi.object({
  question: Joi.string()
    .required()
    .messages({ "any.required": "Question is required" }),
  answer: Joi.string()
    .required()
    .messages({ "any.required": "Answer is required" }),
  category: Joi.string()
    .required()
    .messages({ "any.required": "Category is required" }),
  order: Joi.number().default(0),
});

const updateFAQSchema = Joi.object({
  question: Joi.string(),
  answer: Joi.string(),
  category: Joi.string(),
  order: Joi.number(),
  isActive: Joi.boolean(),
});

// Public routes
router.get("/", getAllFAQs);
router.get("/categories", getFAQCategories);
router.patch("/:id/views", incrementFAQViews);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(createFAQSchema),
  createFAQ,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(updateFAQSchema),
  updateFAQ,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteFAQ,
);

export default router;
