import rateLimit from "express-rate-limit";
import { Request } from "express";
import { config } from "../config";

// Development mode: disable rate limiting to allow rapid testing
const isDevelopment = config.nodeEnv === "development";

const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  const forwardedIp =
    typeof forwarded === "string"
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
export const apiLimiter = rateLimit({
  windowMs: isDevelopment ? 60 * 60 * 1000 : 15 * 60 * 1000, // 1 hour (dev) or 15 minutes (prod)
  max: isDevelopment ? 5000 : 1500, // 5000/hour (dev) or 1500/15min (prod) - increased from 500
  skip: (req: Request) => isDevelopment || req.method === "GET", // Skip for dev mode or GET requests (safe, read-only)
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => getClientIp(req),
});

// Auth endpoints - per email/username to avoid blocking other users
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again after 15 minutes.",
  keyGenerator: (req: Request) => {
    // Use email from body for login/signup (not IP to avoid IPv6 issues with custom keyGenerator)
    const email = (
      req.body?.email ||
      req.body?.username ||
      "unknown"
    ).toLowerCase();
    return email;
  },
});

// Password reset - per email to avoid blocking other users
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 password reset attempts per hour per email
  message: "Too many password reset attempts, please try again after 1 hour.",
  skipSuccessfulRequests: false,
  keyGenerator: (req: Request) => {
    // Use email from body (not IP to avoid IPv6 issues with custom keyGenerator)
    const email = (req.body?.email || "unknown").toLowerCase();
    return email;
  },
});

// Payment endpoint limit - per authenticated user
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 payment attempts per hour
  message: "Too many payment attempts, please try again later.",
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, or a placeholder (not IP to avoid IPv6 issues with custom keyGenerator)
    const userId = (req as any).user?.id || "anonymous";
    return String(userId);
  },
});

// File upload limit - per authenticated user
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: "Too many file uploads, please try again later.",
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, or a placeholder (not IP to avoid IPv6 issues with custom keyGenerator)
    const userId = (req as any).user?.id || "anonymous";
    return String(userId);
  },
});
