import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false })

    if (error) {
      const errors = error.details.reduce((acc, detail) => {
        acc[detail.path.join('.')] = detail.message
        return acc
      }, {} as Record<string, string>)

      res.status(400).json({
        message: 'Validation error',
        errors,
      })
      return
    }

    next()
  }
}

// Maharashtra validation
export const validateMaharashtra = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const state = req.body.state || req.body.shippingAddress?.state

  if (state && state.toLowerCase() !== 'maharashtra') {
    res.status(403).json({
      message: 'This service is currently available only in Maharashtra.',
    })
    return
  }

  next()
}
