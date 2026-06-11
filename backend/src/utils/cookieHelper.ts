import { CookieOptions, Response } from "express";
import { config } from "../config";

const getAuthCookieOptions = (maxAge?: number): CookieOptions => {
  const isProduction = config.nodeEnv === "production";
  const isCrossDomain = process.env.CROSS_DOMAIN_COOKIES === "true";
  const sameSite = isCrossDomain ? "none" : "lax";

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: sameSite === "none" ? true : isProduction,
    sameSite,
    path: "/",
  };

  if (maxAge) {
    cookieOptions.maxAge = maxAge;
  }

  // Only set domain if it is a bare hostname/domain, not a URL.
  if (
    config.cookieDomain &&
    !config.cookieDomain.includes("http") &&
    !config.cookieDomain.includes("/") &&
    !config.cookieDomain.includes(":")
  ) {
    cookieOptions.domain = config.cookieDomain;
  }

  return cookieOptions;
};

export const setAuthCookie = (
  res: Response,
  token: string,
  options?: { maxAge?: number },
): void => {
  const maxAge = options?.maxAge || 24 * 60 * 60 * 1000;
  res.cookie("authToken", token, getAuthCookieOptions(maxAge));
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie("authToken", getAuthCookieOptions());
};
