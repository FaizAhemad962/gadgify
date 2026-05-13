"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.paymentLimiter = exports.passwordResetLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("../config");
// Development mode: disable rate limiting to allow rapid testing
const isDevelopment = config_1.config.nodeEnv === "development";
const getClientIp = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    const forwardedIp = typeof forwarded === "string"
        ? forwarded.split(",")[0]?.trim()
        : forwarded?.[0]?.trim();
    const raw = forwardedIp || req.socket?.remoteAddress || req.ip || "";
    if (raw.startsWith("[") && raw.includes("]")) {
        return raw.slice(1, raw.indexOf("]"));
    }
    const ipv4WithPort = raw.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
    if (ipv4WithPort?.[1]) {
        return ipv4WithPort[1];
    }
    return raw.replace(/^::ffff:/, "");
};
// General API rate limit - per IP
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: isDevelopment ? 60 * 60 * 1000 : 15 * 60 * 1000, // 1 hour (dev) or 15 minutes (prod)
    max: isDevelopment ? 5000 : 1500, // 5000/hour (dev) or 1500/15min (prod) - increased from 500
    skip: (req) => isDevelopment || req.method === "GET", // Skip for dev mode or GET requests (safe, read-only)
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIp(req),
});
// Auth endpoints - per email/username to avoid blocking other users
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 login attempts per 15 minutes
    skipSuccessfulRequests: true,
    message: "Too many login attempts, please try again after 15 minutes.",
    keyGenerator: (req) => {
        // Use email from body for login/signup (not IP to avoid IPv6 issues with custom keyGenerator)
        const email = (req.body?.email ||
            req.body?.username ||
            "unknown").toLowerCase();
        return email;
    },
});
// Password reset - per email to avoid blocking other users
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 password reset attempts per hour per email
    message: "Too many password reset attempts, please try again after 1 hour.",
    skipSuccessfulRequests: false,
    keyGenerator: (req) => {
        // Use email from body (not IP to avoid IPv6 issues with custom keyGenerator)
        const email = (req.body?.email || "unknown").toLowerCase();
        return email;
    },
});
// Payment endpoint limit - per authenticated user
exports.paymentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 payment attempts per hour
    message: "Too many payment attempts, please try again later.",
    keyGenerator: (req) => {
        // Use user ID if authenticated, or a placeholder (not IP to avoid IPv6 issues with custom keyGenerator)
        const userId = req.user?.id || "anonymous";
        return String(userId);
    },
});
// File upload limit - per authenticated user
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: "Too many file uploads, please try again later.",
    keyGenerator: (req) => {
        // Use user ID if authenticated, or a placeholder (not IP to avoid IPv6 issues with custom keyGenerator)
        const userId = req.user?.id || "anonymous";
        return String(userId);
    },
});
