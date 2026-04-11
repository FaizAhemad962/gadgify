"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const flashSaleController_1 = require("../controllers/flashSaleController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
// Validation schemas
const createFlashSaleSchema = joi_1.default.object({
    productId: joi_1.default.string(),
    title: joi_1.default.string()
        .required()
        .messages({ "any.required": "Title is required" }),
    description: joi_1.default.string(),
    discountPercentage: joi_1.default.number().min(0).max(100).required(),
    maxDiscount: joi_1.default.number().min(0),
    startTime: joi_1.default.date()
        .required()
        .messages({ "any.required": "Start time is required" }),
    endTime: joi_1.default.date().required().greater(joi_1.default.ref("startTime")).messages({
        "date.greater": "End time must be after start time",
        "any.required": "End time is required",
    }),
});
const updateFlashSaleSchema = joi_1.default.object({
    title: joi_1.default.string(),
    description: joi_1.default.string(),
    discountPercentage: joi_1.default.number().min(0).max(100),
    maxDiscount: joi_1.default.number().min(0),
    startTime: joi_1.default.date(),
    endTime: joi_1.default.date(),
    isActive: joi_1.default.boolean(),
});
// Public routes
router.get("/", flashSaleController_1.getAllFlashSales);
router.get("/upcoming", flashSaleController_1.getUpcomingFlashSales);
router.get("/:id", flashSaleController_1.getFlashSaleById);
// Admin routes
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), (0, validate_1.validate)(createFlashSaleSchema), flashSaleController_1.createFlashSale);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), (0, validate_1.validate)(updateFlashSaleSchema), flashSaleController_1.updateFlashSale);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), flashSaleController_1.deleteFlashSale);
exports.default = router;
