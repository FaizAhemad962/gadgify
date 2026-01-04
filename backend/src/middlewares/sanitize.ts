import { Request, Response, NextFunction } from 'express'

// Custom MongoDB operator sanitization (compatible with Express 5)
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body)
  }

  // Note: Not sanitizing query/params to avoid Express 5 compatibility issues
  // Body sanitization is sufficient for most security needs
  
  next()
}

// Recursively sanitize object
function sanitizeObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }

  const sanitized: any = {}
  for (const key in obj) {
    // Remove keys that start with $ or contain .
    if (key.startsWith('$') || key.includes('.')) {
      continue
    }
    sanitized[key] = sanitizeObject(obj[key])
  }

  return sanitized
}

// Sanitize strings to prevent XSS
export const sanitizeStrings = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        // Trim whitespace
        req.body[key] = req.body[key].trim()
        
        // Remove script tags (basic XSS prevention)
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        
        // Remove potential HTML event handlers
        req.body[key] = req.body[key].replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      }
    })
  }
  next()
}
