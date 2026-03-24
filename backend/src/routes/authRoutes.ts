import { Router } from "express";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  updateProfilePhoto,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { authenticate } from "../middlewares/auth";
import { validate, validateMaharashtra } from "../middlewares/validate";
import { authLimiter } from "../middlewares/rateLimiter";
import {
  loginSchema,
  signupSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators";
import { upload } from "../middlewares/upload";

const router = Router();

router.post(
  "/signup",
  authLimiter,
  validate(signupSchema),
  validateMaharashtra,
  signup,
);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);
router.get("/profile", authenticate, getProfile);
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  updateProfile,
);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePassword,
);
router.post(
  "/profile-photo",
  authenticate,
  upload.single("image"),
  updateProfilePhoto,
);

export default router;
