import { Request, Response, NextFunction } from 'express'

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

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500
  err.message = err.message || 'Internal Server Error'

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      message: err.message,
      error: err,
      stack: err.stack,
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
