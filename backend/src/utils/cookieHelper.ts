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
  const maxAge = options?.maxAge || 24 * 60 * 60 * 1000;
  const isProduction = config.nodeEnv === "production";

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    domain: config.cookieDomain,
    maxAge,
  });
};

/**
 * Helper function to clear auth cookie
 * ✅ SECURITY: Uses same SameSite=Lax for logout as login to ensure cookie is cleared
 */
export const clearAuthCookie = (res: Response): void => {
  const isProduction = config.nodeEnv === "production";

  res.clearCookie("authToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    domain: config.cookieDomain,
  });
};
