import rateLimit from "express-rate-limit";

// Development mode: disable rate limiting to allow rapid testing
const isDevelopment = process.env.NODE_ENV === "development";

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 min (dev) or 15 minutes (prod)
  max: isDevelopment ? 1000 : 100, // 1000/min (dev) or 100/15min (prod)
  skip: () => isDevelopment, // Skip rate limiting entirely in development
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again after 15 minutes.",
});

// CRITICAL: Strict limit for password reset (3 attempts per hour)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 password reset attempts per hour (stricter than auth limiter)
  message: "Too many password reset attempts, please try again after 1 hour.",
  skipSuccessfulRequests: false, // Count all attempts including successful ones
});

// Payment endpoint limit
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: "Too many payment attempts, please try again later.",
});

// File upload limit
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: "Too many file uploads, please try again later.",
});
