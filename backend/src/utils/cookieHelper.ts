import { Response } from "express";
import { config } from "../config";

/**
 * Helper function to set auth cookies with proper security flags
 * - Secure flag: Only in production (HTTPS)
 * - HttpOnly: Always (prevents XSS access)
 * - SameSite=Lax: Modern security standard (prevents CSRF while allowing navigation)
 */
export const setAuthCookie = (
  res: Response,
  token: string,
  options?: { maxAge?: number },
): void => {
  const maxAge = options?.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
  const maxAgeSeconds = Math.floor(maxAge / 1000);

  // Only add Secure flag in production (HTTPS)
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "Secure; " : "";

  // ✅ SECURITY: Use host-only cookies by NOT setting the Domain attribute.
  // This is safer and more compatible with modern browsers and public suffixes
  // like .onrender.com or .vercel.app where browsers block cookies with Domain set.
  const cookieValue = `authToken=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${maxAgeSeconds}`;

  res.setHeader("Set-Cookie", cookieValue);
};

/**
 * Helper function to clear auth cookie
 */
export const clearAuthCookie = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "Secure; " : "";

  const cookieValue = `authToken=; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0`;

  res.setHeader("Set-Cookie", cookieValue);
};
