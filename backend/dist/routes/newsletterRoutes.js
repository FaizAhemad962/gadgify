"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const newsletterController_1 = require("../controllers/newsletterController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const newsletterValidator_1 = require("../validators/newsletterValidator");
const router = express_1.default.Router();
// Public routes
/**
 * POST /api/newsletters/subscribe
 * Subscribe email to newsletter
 */
router.post("/subscribe", (0, validate_1.validate)(newsletterValidator_1.validateNewsletterSubscribe), newsletterController_1.subscribeToNewsletter);
/**
 * POST /api/newsletters/unsubscribe
 * Unsubscribe email from newsletter
 */
router.post("/unsubscribe", (0, validate_1.validate)(newsletterValidator_1.validateNewsletterUnsubscribe), newsletterController_1.unsubscribeFromNewsletter);
// Admin protected routes
/**
 * GET /api/newsletters
 * Get all newsletter subscribers (Admin only)
 */
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), newsletterController_1.getAllNewsletterSubscribers);
/**
 * GET /api/newsletters/stats
 * Get newsletter statistics (Admin only)
 */
router.get("/stats", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), newsletterController_1.getNewsletterStats);
exports.default = router;
