import { Response } from "express";
import { config } from "../config";

/**
 * Extract domain from URL
 * https://www.aftechnology.com → .aftechnology.com
 * http://localhost:3000 → (none, use default)
 */
const getDomainFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // For localhost or 127.0.0.1, don't set Domain (browser will use current domain)
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return null;
    }

    // For production domains, add leading dot for subdomain matching
    // This allows www.aftechnology.com and api.aftechnology.com to share the cookie
    return `.${hostname}`;
  } catch {
    return null;
  }
};

/**
 * Helper function to set auth cookies with proper security flags
 * - Secure flag: Only in production (HTTPS)
 * - HttpOnly: Always (prevents XSS access)
 * - SameSite=Strict: Always (prevents CSRF)
 * - Domain: Extracted from FRONTEND_URL to allow cross-subdomain sharing
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

  // Extract domain from FRONTEND_URL for proper cookie sharing
  const domain = getDomainFromUrl(config.frontendUrl);
  const domainFlag = domain ? `Domain=${domain}; ` : "";

  const cookieValue = `authToken=${token}; Path=/; ${domainFlag}HttpOnly; ${secureFlag}SameSite=Strict; Max-Age=${maxAgeSeconds}`;

  res.setHeader("Set-Cookie", cookieValue);
};

/**
 * Helper function to clear auth cookie
 */
export const clearAuthCookie = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "Secure; " : "";

  // Extract domain from FRONTEND_URL for proper cookie clearing
  const domain = getDomainFromUrl(config.frontendUrl);
  const domainFlag = domain ? `Domain=${domain}; ` : "";

  const cookieValue = `authToken=; Path=/; ${domainFlag}HttpOnly; ${secureFlag}SameSite=Strict; Max-Age=0`;

  res.setHeader("Set-Cookie", cookieValue);
};
