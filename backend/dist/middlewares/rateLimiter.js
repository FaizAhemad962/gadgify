"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.paymentLimiter = exports.passwordResetLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Development mode: disable rate limiting to allow rapid testing
const isDevelopment = process.env.NODE_ENV === "development";
// General API rate limit
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 min (dev) or 15 minutes (prod)
    max: isDevelopment ? 1000 : 100, // 1000/min (dev) or 100/15min (prod)
    skip: () => isDevelopment, // Skip rate limiting entirely in development
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict limit for auth endpoints
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 login attempts
    skipSuccessfulRequests: true,
    message: "Too many login attempts, please try again after 15 minutes.",
});
// CRITICAL: Strict limit for password reset (3 attempts per hour)
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Only 3 password reset attempts per hour (stricter than auth limiter)
    message: "Too many password reset attempts, please try again after 1 hour.",
    skipSuccessfulRequests: false, // Count all attempts including successful ones
});
// Payment endpoint limit
exports.paymentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 payment attempts per hour
    message: "Too many payment attempts, please try again later.",
});
// File upload limit
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: "Too many file uploads, please try again later.",
});
