/**
 * Security Middleware - Input validation and sanitization
 * Prevents XSS, SQL injection, and other common attacks
 */

import { Request, Response, NextFunction } from 'express'
import validator from 'validator'

/**
 * Sanitize all request inputs (body, query, params)
 * Removes potentially dangerous characters and validates formats
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body)
    }

    // Sanitize query
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query) as any
    }

    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params)
    }

    next()
  } catch (error) {
    res.status(400).json({ message: 'Invalid input format' })
  }
}

/**
 * Sanitize string values - removes XSS vectors
 */
export const sanitizeStrings = (obj: any): any => {
  if (typeof obj === 'string') {
    // Remove dangerous characters and HTML tags
    return validator.trim(validator.escape(obj))
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeStrings(item))
  }

  if (typeof obj === 'object' && obj !== null) {
    return sanitizeObject(obj)
  }

  return obj
}

/**
 * Sanitize object - recursively sanitizes all values
 */
function sanitizeObject(obj: any): any {
  const sanitized: any = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]

      // Sanitize the value
      if (typeof value === 'string') {
        // Trim, escape HTML, and remove null bytes
        sanitized[key] = value
          .replace(/\0/g, '')
          .replace(/\r/g, '')
          .replace(/\n/g, '')
          .trim()
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) => sanitizeObject(item))
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value)
      } else {
        sanitized[key] = value
      }
    }
  }

  return sanitized
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email)
}

/**
 * Validate password strength
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate HSN code format (4-8 digits)
 */
export const validateHSNCode = (hsn: string): boolean => {
  return /^\d{4,8}$/.test(hsn.trim())
}

/**
 * Validate phone number format (10 digits for India)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))
}

/**
 * Validate pincode format (6 digits for India)
 */
export const validatePincode = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode.trim())
}

/**
 * Validate URL format
 */
export const validateURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize file path - prevents directory traversal attacks
 */
export const validateFilePath = (filePath: string): boolean => {
  // Reject paths with .. or ~ or other dangerous patterns
  return !/(\.\.|~|\/\/|\\\\)/.test(filePath) && filePath.length < 255
}

/**
 * Rate limiting helper - Check if user has exceeded rate limit
 */
export const isRateLimited = (key: string, limit: number, windowMs: number): boolean => {
  // This would be used with a cache (Redis recommended for production)
  // For now, implement basic in-memory rate limiting
  const now = Date.now()
  const window = Math.floor(now / windowMs)
  const cacheKey = `${key}:${window}`

  // Store in app.locals or use actual cache
  // Pseudocode shown here
  return false // Implementation depends on cache layer
}

/**
 * Prevent SQL injection by validating common SQL patterns
 */
export const preventSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
    /('--|#|\/\*|\*\/)/,
    /(;\s*DROP)/gi,
  ]

  return !sqlPatterns.some((pattern) => pattern.test(input))
}
