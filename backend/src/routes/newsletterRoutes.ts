import express from "express";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getAllNewsletterSubscribers,
  getNewsletterStats,
} from "../controllers/newsletterController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  validateNewsletterSubscribe,
  validateNewsletterUnsubscribe,
} from "../validators/newsletterValidator";

const router = express.Router();

// Public routes
/**
 * POST /api/newsletters/subscribe
 * Subscribe email to newsletter
 */
router.post(
  "/subscribe",
  validate(validateNewsletterSubscribe),
  subscribeToNewsletter,
);

/**
 * POST /api/newsletters/unsubscribe
 * Unsubscribe email from newsletter
 */
router.post(
  "/unsubscribe",
  validate(validateNewsletterUnsubscribe),
  unsubscribeFromNewsletter,
);

// Admin protected routes
/**
 * GET /api/newsletters
 * Get all newsletter subscribers (Admin only)
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  getAllNewsletterSubscribers,
);

/**
 * GET /api/newsletters/stats
 * Get newsletter statistics (Admin only)
 */
router.get(
  "/stats",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  getNewsletterStats,
);

export default router;
