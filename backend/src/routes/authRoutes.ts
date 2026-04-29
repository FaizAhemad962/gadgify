import { Router } from "express";
import {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  updateProfilePhoto,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getCsrfToken,
} from "../controllers/authController";
import { authenticate } from "../middlewares/auth";
import { validate, validateMaharashtra } from "../middlewares/validate";
import { authLimiter, passwordResetLimiter } from "../middlewares/rateLimiter";
import {
  loginSchema,
  signupSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators";
import { upload, validateMagicBytesMiddleware } from "../middlewares/upload";

const router = Router();

router.post(
  "/signup",
  authLimiter,
  validate(signupSchema),
  validateMaharashtra,
  signup,
);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", authenticate, logout);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  passwordResetLimiter,
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
  validateMagicBytesMiddleware(["jpg", "jpeg", "png", "gif", "webp"]),
  updateProfilePhoto,
);

// ✅ SECURITY: Email verification endpoints
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail);

// ✅ SECURITY: Get CSRF token for client
router.get("/csrf-token", getCsrfToken);

export default router;
