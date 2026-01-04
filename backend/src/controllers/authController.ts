import { Request, Response, NextFunction } from 'express'
import prisma from '../config/database'
import { hashPassword, comparePassword, generateToken } from '../utils/auth'
import { AuthRequest } from '../middlewares/auth'
import { validatePasswordStrength } from '../middlewares/securityValidator'
import logger from '../utils/logger'

// SECURITY: Track failed login attempts (use Redis in production)
const failedLoginAttempts = new Map<string, { count: number; timestamp: number }>()
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

/**
 * Check if account is locked due to failed attempts
 */
const isAccountLocked = (email: string): boolean => {
  const attempts = failedLoginAttempts.get(email)
  if (!attempts) return false

  const elapsed = Date.now() - attempts.timestamp
  if (elapsed > LOCKOUT_DURATION) {
    failedLoginAttempts.delete(email)
    return false
  }

  return attempts.count >= MAX_FAILED_ATTEMPTS
}

/**
 * Record failed login attempt
 */
const recordFailedLoginAttempt = (email: string): void => {
  const attempts = failedLoginAttempts.get(email) || { count: 0, timestamp: Date.now() }
  attempts.count++
  attempts.timestamp = Date.now()
  failedLoginAttempts.set(email, attempts)

  if (attempts.count >= MAX_FAILED_ATTEMPTS) {
    logger.warn(`Account locked: ${email} after ${MAX_FAILED_ATTEMPTS} failed attempts`)
  }
}

/**
 * Clear failed login attempts
 */
const clearFailedLoginAttempts = (email: string): void => {
  failedLoginAttempts.delete(email)
}

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name, phone, state, city, address, pincode } = req.body

    // SECURITY: Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      res.status(400).json({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
      })
      return
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' })
      return
    }

    // Hash password (bcrypt with proper salt rounds)
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        state,
        city,
        address,
        pincode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        state: true,
        city: true,
        address: true,
        pincode: true,
        createdAt: true,
      },
    })

    // Log signup event
    logger.info(`User signup: ${email}`)

    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    res.status(201).json({ token, user })
  } catch (error) {
    next(error)
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body

    // SECURITY: Check if account is locked
    if (isAccountLocked(email)) {
      logger.warn(`Login attempt on locked account: ${email}`)
      res.status(429).json({
        message: 'Too many failed login attempts. Please try again later.',
      })
      return
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // SECURITY: Don't reveal if email exists
      recordFailedLoginAttempt(email)
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      // SECURITY: Track failed attempt
      recordFailedLoginAttempt(email)
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    // SECURITY: Clear failed attempts on successful login
    clearFailedLoginAttempts(email)

    // Log login event
    logger.info(`User login: ${email}`)
    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    const { password: _, ...userWithoutPassword } = user

    res.json({ token, user: userWithoutPassword })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        state: true,
        city: true,
        address: true,
        pincode: true,
        createdAt: true,
      },
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}
