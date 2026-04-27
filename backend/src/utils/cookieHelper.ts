import { Response } from "express";

/**
 * Helper function to set auth cookies with proper security flags
 * - Secure flag: Only in production (HTTPS)
 * - HttpOnly: Always (prevents XSS access)
 * - SameSite=Strict: Always (prevents CSRF)
 */
export const setAuthCookie = (
  res: Response,
  token: string,
  options?: { maxAge?: number },
): void => {
  const maxAge = options?.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
  const maxAgeSeconds = Math.floor(maxAge / 1000);

  // Only add Secure flag in production (HTTPS)
  // In development, we use HTTP, so Secure flag would prevent cookie from being set
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "Secure; " : "";

  const cookieValue = `authToken=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Strict; Max-Age=${maxAgeSeconds}`;

  res.setHeader("Set-Cookie", cookieValue);
};

/**
 * Helper function to clear auth cookie
 */
export const clearAuthCookie = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "Secure; " : "";

  const cookieValue = `authToken=; Path=/; HttpOnly; ${secureFlag}SameSite=Strict; Max-Age=0`;

  res.setHeader("Set-Cookie", cookieValue);
};
