"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const csrfProtection_1 = require("../middlewares/csrfProtection");
const validators_1 = require("../validators");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
router.post("/signup", rateLimiter_1.authLimiter, (0, validate_1.validate)(validators_1.signupSchema), validate_1.validateMaharashtra, authController_1.signup);
router.post("/login", rateLimiter_1.authLimiter, (0, validate_1.validate)(validators_1.loginSchema), authController_1.login);
router.post("/logout", auth_1.authenticate, authController_1.logout);
router.post("/forgot-password", rateLimiter_1.passwordResetLimiter, (0, validate_1.validate)(validators_1.forgotPasswordSchema), authController_1.forgotPassword);
router.post("/reset-password", rateLimiter_1.passwordResetLimiter, (0, validate_1.validate)(validators_1.resetPasswordSchema), authController_1.resetPassword);
router.get("/profile", auth_1.authenticate, authController_1.getProfile);
router.put("/profile", auth_1.authenticate, (0, validate_1.validate)(validators_1.updateProfileSchema), authController_1.updateProfile);
router.post("/change-password", auth_1.authenticate, (0, validate_1.validate)(validators_1.changePasswordSchema), authController_1.changePassword);
router.post("/profile-photo", auth_1.authenticate, upload_1.upload.single("image"), (0, upload_1.validateMagicBytesMiddleware)(["jpg", "jpeg", "png", "gif", "webp"]), authController_1.updateProfilePhoto);
// ✅ SECURITY: Email verification endpoints
router.post("/verify-email", authController_1.verifyEmail);
router.post("/resend-verification-email", authController_1.resendVerificationEmail);
// ✅ SECURITY: Get CSRF token for client
router.get("/csrf-token", csrfProtection_1.getCSRFToken);
exports.default = router;
