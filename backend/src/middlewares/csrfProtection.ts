import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// Store CSRF tokens with additional metadata for better security
interface CsrfTokenData {
  timestamp: number;
  usageCount: number;
  lastUsed: number;
  sessionId?: string;
}

// Store CSRF tokens in memory (use Redis in production)
const csrfTokenStore = new Map<string, CsrfTokenData>();
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const MAX_TOKEN_USAGE = 100; // Prevent token reuse abuse

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const csrfTokenGenerator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Safely derive an identifier
  const sessionId = (req as any).sessionID || (req as any).user?.id || req.ip;

  const token = generateCSRFToken();

  csrfTokenStore.set(token, {
    timestamp: Date.now(),
    usageCount: 0,
    lastUsed: Date.now(),
    sessionId,
  });

  res.locals.csrfToken = token;
  (req as any).csrfToken = token;

  next();
};

export const verifyCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const token = (req.headers["x-csrf-token"] as string) || req.body?.csrfToken;

  if (!token) {
    return res.status(403).json({
      success: false,
      message: "CSRF token is required",
    });
  }

  const stored = csrfTokenStore.get(token);

  if (!stored) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired CSRF token",
    });
  }

  // ✅ SECURITY: Check token expiry
  if (Date.now() - stored.timestamp > TOKEN_EXPIRY) {
    csrfTokenStore.delete(token);
    return res.status(403).json({
      success: false,
      message: "CSRF token has expired",
    });
  }

  // ✅ SECURITY: Check for suspicious token reuse patterns
  // If same token used too many times, could indicate attack
  if (stored.usageCount > MAX_TOKEN_USAGE) {
    csrfTokenStore.delete(token);
    return res.status(403).json({
      success: false,
      message: "CSRF token usage limit exceeded",
    });
  }

  // ✅ SECURITY: Update token metadata (do NOT delete token)
  // Tokens remain valid within their expiry window to support
  // frontend caching and legitimate token reuse
  stored.usageCount++;
  stored.lastUsed = Date.now();

  // Store updated metadata
  csrfTokenStore.set(token, stored);

  next();
};

export const cleanupExpiredTokens = () => {
  setInterval(
    () => {
      const now = Date.now();
      let cleanedCount = 0;
      for (const [token, data] of csrfTokenStore.entries()) {
        if (now - data.timestamp > TOKEN_EXPIRY) {
          csrfTokenStore.delete(token);
          cleanedCount++;
        }
      }
      if (cleanedCount > 0) {
        console.log(`[CSRF] Cleaned up ${cleanedCount} expired tokens`);
      }
    },
    60 * 60 * 1000, // Run every hour
  );
};

/**
 * Route handler to get a fresh CSRF token
 * Clients call this endpoint to get a token for protected requests
 */
export const getCSRFToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = generateCSRFToken();
    const sessionId = (req as any).sessionID || (req as any).user?.id || req.ip;

    csrfTokenStore.set(token, {
      timestamp: Date.now(),
      usageCount: 0,
      lastUsed: Date.now(),
      sessionId,
    });

    // ✅ SECURITY: Log token generation for audit trail
    console.log(
      `[CSRF] Generated new token for session: ${sessionId?.slice(0, 8)}...`,
    );

    res.json({
      success: true,
      csrfToken: token,
    });
  } catch (error) {
    next(error);
  }
};
