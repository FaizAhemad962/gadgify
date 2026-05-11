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

  const sameSite = isCrossDomain ? "none" : "lax";
  const cookieOptions: any = {
    httpOnly: true,
    secure: sameSite === "none" ? true : isProduction,
    sameSite,
    path: "/",
    maxAge,
  };

  // ✅ Only set domain if it's valid
  if (
    config.cookieDomain &&
    !config.cookieDomain.includes("http") &&
    !config.cookieDomain.includes("/") &&
    !config.cookieDomain.includes(":")
  ) {
    cookieOptions.domain = config.cookieDomain;
  }
  res.cookie("authToken", token, cookieOptions);
};

/**
 * Helper function to clear auth cookie
 * ✅ SECURITY: Uses same SameSite flags as setAuthCookie to ensure proper clearing
 */
export const clearAuthCookie = (res: Response): void => {
  const isProduction = config.nodeEnv === "production";
  const isCrossDomain = process.env.CROSS_DOMAIN_COOKIES === "true";
  const sameSite = isCrossDomain ? "none" : "lax";

  const clearOptions: any = {
    httpOnly: true,
    secure: sameSite === "none" ? true : isProduction,
    sameSite,
    path: "/",
  };

  if (
    config.cookieDomain &&
    !config.cookieDomain.includes("http") &&
    !config.cookieDomain.includes("/") &&
    !config.cookieDomain.includes(":")
  ) {
    clearOptions.domain = config.cookieDomain;
  }

  res.clearCookie("authToken", clearOptions);
};
