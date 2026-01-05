import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

// Store CSRF tokens in memory (use Redis in production)
const csrfTokenStore = new Map<string, { timestamp: number }>()
const TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

export const csrfTokenGenerator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Safely derive an identifier
  const sessionId =
    (req as any).sessionID ||
    (req as any).user?.id ||
    req.ip

  const token = generateCSRFToken()

  csrfTokenStore.set(token, {
    timestamp: Date.now(),
  })

  res.locals.csrfToken = token
  ;(req as any).csrfToken = token

  next()
}

export const verifyCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  const token =
    (req.headers['x-csrf-token'] as string) ||
    req.body?.csrfToken

  if (!token) {
    return res.status(403).json({ message: 'CSRF token is required' })
  }

  const stored = csrfTokenStore.get(token)

  if (!stored) {
    return res.status(403).json({ message: 'Invalid or expired CSRF token' })
  }

  if (Date.now() - stored.timestamp > TOKEN_EXPIRY) {
    csrfTokenStore.delete(token)
    return res.status(403).json({ message: 'CSRF token has expired' })
  }

  csrfTokenStore.delete(token)
  next()
}

export const cleanupExpiredTokens = () => {
  setInterval(() => {
    const now = Date.now()
    for (const [token, data] of csrfTokenStore.entries()) {
      if (now - data.timestamp > TOKEN_EXPIRY) {
        csrfTokenStore.delete(token)
      }
    }
  }, 60 * 60 * 1000)
}
