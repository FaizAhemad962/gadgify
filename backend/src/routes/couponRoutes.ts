import { Router } from "express";
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  validateCouponSchema,
  createCouponSchema,
  updateCouponSchema,
} from "../validators";

const router = Router();

// User: validate a coupon code
router.post(
  "/validate",
  authenticate,
  validate(validateCouponSchema),
  validateCoupon,
);

// Admin: CRUD
router.get("/", authenticate, authorize("ADMIN", "SUPER_ADMIN"), getAllCoupons);
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(createCouponSchema),
  createCoupon,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(updateCouponSchema),
  updateCoupon,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteCoupon,
);

export default router;
