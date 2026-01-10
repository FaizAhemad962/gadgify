"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.ratingSchema = exports.createOrderSchema = exports.updateCartItemSchema = exports.addToCartSchema = exports.productSchema = exports.signupSchema = exports.loginSchema = void 0;
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
    pincode: joi_1.default.string().pattern(/^\d{6}$/).required(),
});
exports.productSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    description: joi_1.default.string().min(10).required(),
    price: joi_1.default.number().min(1).required(),
    stock: joi_1.default.number().min(0).required(),
    imageUrl: joi_1.default.string().uri().required(),
    videoUrl: joi_1.default.string().uri().optional().allow(''),
    colors: joi_1.default.string().optional().allow(''),
    category: joi_1.default.string().min(2).required(),
    hsnNo: joi_1.default.string().optional().allow(''),
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
    comment: joi_1.default.string().max(500).optional().allow(''),
});
exports.updateProfileSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    phone: joi_1.default.string().min(10).required(),
    city: joi_1.default.string().required(),
    address: joi_1.default.string().min(5).required(),
    pincode: joi_1.default.string().pattern(/^\d{6}$/).required(),
});
exports.changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(6).required(),
});
