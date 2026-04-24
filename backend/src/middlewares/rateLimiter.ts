import rateLimit from "express-rate-limit";
import { Request } from "express";

// Development mode: disable rate limiting to allow rapid testing
const isDevelopment = process.env.NODE_ENV === "development";

// General API rate limit - per IP
export const apiLimiter = rateLimit({
  windowMs: isDevelopment ? 60 * 60 * 1000 : 15 * 60 * 1000, // 1 hour (dev) or 15 minutes (prod)
  max: isDevelopment ? 5000 : 500, // 5000/hour (dev) or 500/15min (prod)
  skip: () => isDevelopment, // Skip rate limiting entirely in development
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints - per email/username to avoid blocking other users
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again after 15 minutes.",
  keyGenerator: (req: Request) => {
    // Use email from body for login/signup, fallback to IP
    const email = (
      req.body?.email ||
      req.body?.username ||
      req.ip ||
      ""
    ).toLowerCase();
    return email || req.ip || "unknown";
  },
});

// Password reset - per email to avoid blocking other users
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 password reset attempts per hour per email
  message: "Too many password reset attempts, please try again after 1 hour.",
  skipSuccessfulRequests: false,
  keyGenerator: (req: Request) => {
    // Use email from body, fallback to IP
    const email = (req.body?.email || req.ip || "").toLowerCase();
    return email || req.ip || "unknown";
  },
});

// Payment endpoint limit - per authenticated user
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 payment attempts per hour
  message: "Too many payment attempts, please try again later.",
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, fallback to IP
    const userId = (req as any).user?.id || req.ip || "unknown";
    return String(userId);
  },
});

// File upload limit - per authenticated user
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: "Too many file uploads, please try again later.",
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, fallback to IP
    const userId = (req as any).user?.id || req.ip || "unknown";
    return String(userId);
  },
});
