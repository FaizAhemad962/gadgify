import { Response } from "express";

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
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge,
  });
};

/**
 * Helper function to clear auth cookie
 */
export const clearAuthCookie = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("authToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
};
