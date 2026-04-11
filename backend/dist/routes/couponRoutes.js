"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const couponController_1 = require("../controllers/couponController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const validators_1 = require("../validators");
const router = (0, express_1.Router)();
// User: validate a coupon code
router.post("/validate", auth_1.authenticate, (0, validate_1.validate)(validators_1.validateCouponSchema), couponController_1.validateCoupon);
// Admin: CRUD
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), couponController_1.getAllCoupons);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), (0, validate_1.validate)(validators_1.createCouponSchema), couponController_1.createCoupon);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), (0, validate_1.validate)(validators_1.updateCouponSchema), couponController_1.updateCoupon);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), couponController_1.deleteCoupon);
exports.default = router;
