import { Response } from "express";
import { config } from "../config";

/**
 * Helper function to set auth cookies with proper security flags
 * For cross-domain requests (frontend on different domain than backend):
 * - Use SameSite=None; Secure for production (allows cross-domain cookies)
 * For same-domain scenarios:
 * - Use SameSite=Lax (prevents CSRF while allowing navigation)
 */
export const setAuthCookie = (
  res: Response,
  token: string,
  options?: { maxAge?: number },
): void => {
  const maxAge = options?.maxAge || 24 * 60 * 60 * 1000;
  const isProduction = config.nodeEnv === "production";
  const isCrossDomain = process.env.CROSS_DOMAIN_COOKIES === "true";

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: isProduction, // ✅ Required for SameSite=None in production
    sameSite: isCrossDomain ? "none" : "lax", // ✅ Use 'none' for cross-domain
    path: "/",
    domain: config.cookieDomain,
    maxAge,
  });
};

/**
 * Helper function to clear auth cookie
 * ✅ SECURITY: Uses same SameSite flags as setAuthCookie to ensure proper clearing
 */
export const clearAuthCookie = (res: Response): void => {
  const isProduction = config.nodeEnv === "production";
  const isCrossDomain = process.env.CROSS_DOMAIN_COOKIES === "true";

  res.clearCookie("authToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isCrossDomain ? "none" : "lax", // ✅ Match setAuthCookie behavior
    path: "/",
    domain: config.cookieDomain,
  });
};
