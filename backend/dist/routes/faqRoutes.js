"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const faqController_1 = require("../controllers/faqController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
// Validation schemas
const createFAQSchema = joi_1.default.object({
    question: joi_1.default.string()
        .required()
        .messages({ "any.required": "Question is required" }),
    answer: joi_1.default.string()
        .required()
        .messages({ "any.required": "Answer is required" }),
    category: joi_1.default.string()
        .required()
        .messages({ "any.required": "Category is required" }),
    order: joi_1.default.number().default(0),
});
const updateFAQSchema = joi_1.default.object({
    question: joi_1.default.string(),
    answer: joi_1.default.string(),
    category: joi_1.default.string(),
    order: joi_1.default.number(),
    isActive: joi_1.default.boolean(),
});
// Public routes
router.get("/", faqController_1.getAllFAQs);
router.get("/categories", faqController_1.getFAQCategories);
router.patch("/:id/views", faqController_1.incrementFAQViews);
// Admin routes
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), (0, validate_1.validate)(createFAQSchema), faqController_1.createFAQ);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), (0, validate_1.validate)(updateFAQSchema), faqController_1.updateFAQ);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), faqController_1.deleteFAQ);
exports.default = router;
