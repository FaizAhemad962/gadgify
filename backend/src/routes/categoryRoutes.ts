import { Router } from "express";
import {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createCategorySchema, updateCategorySchema } from "../validators";

const router = Router();

// Public: get active categories
router.get("/", getCategories);

// Admin: get all categories (including inactive)
router.get(
  "/all",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  getAllCategories,
);

// Admin: CRUD
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(createCategorySchema),
  createCategory,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(updateCategorySchema),
  updateCategory,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteCategory,
);

export default router;
