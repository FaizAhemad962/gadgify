/**
 * CSRF Token Middleware
 * Prevents Cross-Site Request Forgery attacks
 */

import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

// Store CSRF tokens in memory (use Redis in production)
const csrfTokenStore = new Map<string, { token: string; timestamp: number }>()
const TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Middleware to generate and attach CSRF token
 * Call this on GET requests to provide token to client
 */
export const csrfTokenGenerator = (req: Request, res: Response, next: NextFunction): void => {
  const sessionId = req.sessionID || (req as any).user?.id || req.ip
  const token = generateCSRFToken()

  // Store token with expiry
  csrfTokenStore.set(token, {
    token,
    timestamp: Date.now(),
  })

  // Attach to response locals
  res.locals.csrfToken = token
  ;(req as any).csrfToken = token

  next()
}

/**
 * Middleware to verify CSRF token
 * Check this on state-changing requests (POST, PUT, DELETE)
 */
export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF check for GET requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  const token = req.headers['x-csrf-token'] as string || req.body?.csrfToken

  if (!token) {
    return res.status(403).json({ message: 'CSRF token is required' })
  }

  const stored = csrfTokenStore.get(token)

  if (!stored) {
    return res.status(403).json({ message: 'Invalid or expired CSRF token' })
  }

  // Check if token expired
  if (Date.now() - stored.timestamp > TOKEN_EXPIRY) {
    csrfTokenStore.delete(token)
    return res.status(403).json({ message: 'CSRF token has expired' })
  }

  // Token is valid, remove it (single-use)
  csrfTokenStore.delete(token)

  next()
}

/**
 * Clean up expired tokens periodically
 */
export const cleanupExpiredTokens = (): void => {
  setInterval(() => {
    const now = Date.now()
    for (const [token, data] of csrfTokenStore.entries()) {
      if (now - data.timestamp > TOKEN_EXPIRY) {
        csrfTokenStore.delete(token)
      }
    }
  }, 60 * 60 * 1000) // Run every hour
}
