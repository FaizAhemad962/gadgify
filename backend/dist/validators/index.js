"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = exports.updateUserRoleSchema = exports.updateCategorySchema = exports.createCategorySchema = exports.updateCouponSchema = exports.createCouponSchema = exports.validateCouponSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.updateProfileSchema = exports.ratingSchema = exports.createOrderSchema = exports.updateCartItemSchema = exports.addToCartSchema = exports.productSchema = exports.signupSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
exports.signupSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    name: joi_1.default.string().min(2).required(),
    phone: joi_1.default.string().min(10).required(),
    state: joi_1.default.string().required(),
    city: joi_1.default.string().required(),
    address: joi_1.default.string().min(5).required(),
    pincode: joi_1.default.string()
        .pattern(/^\d{6}$/)
        .required(),
});
exports.productSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    description: joi_1.default.string().min(10).required(),
    price: joi_1.default.number().min(1).required(),
    stock: joi_1.default.number().min(0).required(),
    media: joi_1.default.array()
        .items(joi_1.default.object({
        url: joi_1.default.string().uri().required(),
        type: joi_1.default.string().valid("image", "video").required(),
        isPrimary: joi_1.default.boolean().optional(),
    }))
        .min(1)
        .required(),
    colors: joi_1.default.string().optional().allow(""),
    category: joi_1.default.string().min(2).required(),
    hsnNo: joi_1.default.string().optional().allow(""),
    gstPercentage: joi_1.default.number().min(0).max(100).optional(),
});
exports.addToCartSchema = joi_1.default.object({
    productId: joi_1.default.string().required(),
    quantity: joi_1.default.number().min(1).required(),
});
exports.updateCartItemSchema = joi_1.default.object({
    quantity: joi_1.default.number().min(1).required(),
});
exports.createOrderSchema = joi_1.default.object({
    items: joi_1.default.array()
        .items(joi_1.default.object({
        productId: joi_1.default.string().required(),
        quantity: joi_1.default.number().min(1).required(),
        price: joi_1.default.number().min(0).required(),
    }))
        .min(1)
        .required(),
    subtotal: joi_1.default.number().min(0).required(),
    shipping: joi_1.default.number().min(0).required(),
    total: joi_1.default.number().min(0).required(),
    couponCode: joi_1.default.string().trim().max(50).optional().allow(null, ""),
    shippingAddress: joi_1.default.object({
        name: joi_1.default.string().required(),
        phone: joi_1.default.string().required(),
        address: joi_1.default.string().required(),
        city: joi_1.default.string().required(),
        state: joi_1.default.string().required(),
        pincode: joi_1.default.string().required(),
    }).required(),
});
exports.ratingSchema = joi_1.default.object({
    rating: joi_1.default.number().min(1).max(5).required(),
    comment: joi_1.default.string().max(500).optional().allow(""),
});
exports.updateProfileSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    phone: joi_1.default.string().min(10).required(),
    city: joi_1.default.string().required(),
    address: joi_1.default.string().min(5).required(),
    pincode: joi_1.default.string()
        .pattern(/^\d{6}$/)
        .required(),
});
exports.changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(6).required(),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
});
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(6).required(),
});
exports.validateCouponSchema = joi_1.default.object({
    code: joi_1.default.string().trim().min(1).max(50).required(),
    subtotal: joi_1.default.number().min(0).required(),
});
exports.createCouponSchema = joi_1.default.object({
    code: joi_1.default.string().trim().min(2).max(50).required(),
    discountType: joi_1.default.string().valid("PERCENTAGE", "FLAT").required(),
    discountValue: joi_1.default.number().min(0.01).required(),
    minOrderAmount: joi_1.default.number().min(0).optional().default(0),
    maxDiscount: joi_1.default.number().min(0).optional().allow(null),
    usageLimit: joi_1.default.number().integer().min(1).optional().allow(null),
    expiresAt: joi_1.default.string().isoDate().optional().allow(null),
});
exports.updateCouponSchema = joi_1.default.object({
    discountType: joi_1.default.string().valid("PERCENTAGE", "FLAT").optional(),
    discountValue: joi_1.default.number().min(0.01).optional(),
    minOrderAmount: joi_1.default.number().min(0).optional(),
    maxDiscount: joi_1.default.number().min(0).optional().allow(null),
    usageLimit: joi_1.default.number().integer().min(1).optional().allow(null),
    isActive: joi_1.default.boolean().optional(),
    expiresAt: joi_1.default.string().isoDate().optional().allow(null),
});
exports.createCategorySchema = joi_1.default.object({
    name: joi_1.default.string().trim().min(2).max(100).required(),
    description: joi_1.default.string().max(500).optional().allow("", null),
    icon: joi_1.default.string().max(100).optional().allow("", null),
    sortOrder: joi_1.default.number().integer().min(0).optional(),
});
exports.updateCategorySchema = joi_1.default.object({
    name: joi_1.default.string().trim().min(2).max(100).optional(),
    description: joi_1.default.string().max(500).optional().allow("", null),
    icon: joi_1.default.string().max(100).optional().allow("", null),
    sortOrder: joi_1.default.number().integer().min(0).optional(),
    isActive: joi_1.default.boolean().optional(),
});
exports.updateUserRoleSchema = joi_1.default.object({
    role: joi_1.default.string().valid("USER", "ADMIN").required(),
});
exports.createAddressSchema = joi_1.default.object({
    label: joi_1.default.string().trim().max(50).optional().default("Home"),
    name: joi_1.default.string().trim().min(2).max(100).required(),
    phone: joi_1.default.string().min(10).required(),
    address: joi_1.default.string().min(5).required(),
    city: joi_1.default.string().required(),
    state: joi_1.default.string().optional().default("Maharashtra"),
    pincode: joi_1.default.string()
        .pattern(/^\d{6}$/)
        .required(),
    isDefault: joi_1.default.boolean().optional(),
});
exports.updateAddressSchema = joi_1.default.object({
    label: joi_1.default.string().trim().max(50).optional(),
    name: joi_1.default.string().trim().min(2).max(100).optional(),
    phone: joi_1.default.string().min(10).optional(),
    address: joi_1.default.string().min(5).optional(),
    city: joi_1.default.string().optional(),
    state: joi_1.default.string().optional(),
    pincode: joi_1.default.string()
        .pattern(/^\d{6}$/)
        .optional(),
    isDefault: joi_1.default.boolean().optional(),
});
