import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Safe error message mapping
 * Maps internal errors to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  'User not found': 'Invalid credentials',
  'Incorrect password': 'Invalid credentials',
  'Email already registered': 'Email already in use',
  'Product not found': 'Product not found',
  'Insufficient stock': 'Item out of stock',
  'Unauthorized': 'You do not have permission',
  'Forbidden': 'Access denied',
  'Not found': 'Resource not found',
  'Bad request': 'Invalid request',
  'Duplicate entry': 'Record already exists',
  'Validation failed': 'Please check your input',
}

/**
 * Get safe error message (doesn't expose internal details)
 */
const getSafeErrorMessage = (error: any): string => {
  const message = error?.message || 'An unexpected error occurred'

  // Check for mapped error messages
  for (const [key, safeMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return safeMessage
    }
  }

  // If it's operational error, return as-is
  if (error?.isOperational) {
    return message
  }

  // For unknown errors, return generic message
  return 'An error occurred. Please try again later.'
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log full error for debugging (internal only)
  logger.error({
    message: err?.message,
    stack: err?.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
  })

  const statusCode = err.statusCode || 500
  const safeMessage = getSafeErrorMessage(err)

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      message: safeMessage,
      debug: {
        originalMessage: err.message,
        stack: err.stack,
      },
    })
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        message: err.message,
      })
    } else {
      console.error('ERROR 💥:', err)
      res.status(500).json({
        message: 'Something went wrong',
      })
    }
  }
}

export { AppError }
