import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../utils/email";
import { AuthRequest } from "../middlewares/auth";
import { validatePasswordStrength } from "../middlewares/securityValidator";
import logger from "../utils/logger";
import {
  findUserByEmail,
  isEmailRegisteredWithAnyRole,
} from "../utils/userQueryHelper";

// SECURITY: Track failed login attempts (use Redis in production)
const failedLoginAttempts = new Map<
  string,
  { count: number; timestamp: number }
>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Check if account is locked due to failed attempts
 */
const isAccountLocked = (email: string): boolean => {
  const attempts = failedLoginAttempts.get(email);
  if (!attempts) return false;

  const elapsed = Date.now() - attempts.timestamp;
  if (elapsed > LOCKOUT_DURATION) {
    failedLoginAttempts.delete(email);
    return false;
  }

  return attempts.count >= MAX_FAILED_ATTEMPTS;
};

/**
 * Record failed login attempt
 */
const recordFailedLoginAttempt = (email: string): void => {
  const attempts = failedLoginAttempts.get(email) || {
    count: 0,
    timestamp: Date.now(),
  };
  attempts.count++;
  attempts.timestamp = Date.now();
  failedLoginAttempts.set(email, attempts);

  if (attempts.count >= MAX_FAILED_ATTEMPTS) {
    logger.warn(
      `Account locked: ${email} after ${MAX_FAILED_ATTEMPTS} failed attempts`,
    );
  }
};

/**
 * Clear failed login attempts
 */
const clearFailedLoginAttempts = (email: string): void => {
  failedLoginAttempts.delete(email);
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, name, phone, state, city, address, pincode } =
      req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // SECURITY: Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors,
      });
      return;
    }

    // Single-account mode: one email can have only one account
    const emailAlreadyRegistered =
      await isEmailRegisteredWithAnyRole(normalizedEmail);
    if (emailAlreadyRegistered) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    // Hash password (bcrypt with proper salt rounds)
    const hashedPassword = await hashPassword(password);

    // Create user with proper error handling
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
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
          profilePhoto: true,
          createdAt: true,
        },
      });
    } catch (createError: any) {
      // Handle unique constraint violations that might slip through
      if (
        createError.code === "P2002" ||
        createError.message.includes("Unique constraint failed")
      ) {
        logger.warn(`Signup failed: Email already exists: ${normalizedEmail}`);
        res.status(400).json({ message: "Email already registered" });
        return;
      }
      throw createError;
    }

    // Log signup event
    logger.info(`User signup: ${normalizedEmail}`);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(normalizedEmail, name).catch((err) =>
      logger.error(
        `Welcome email failed for ${normalizedEmail}: ${err.message}`,
      ),
    );

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({ token, user });
  } catch (error) {
    logger.error(
      `Signup error: ${error instanceof Error ? error.message : String(error)}`,
    );
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // SECURITY: Check if account is locked
    if (isAccountLocked(normalizedEmail)) {
      logger.warn(`Login attempt on locked account: ${normalizedEmail}`);
      res.status(429).json({
        message: "Too many failed login attempts. Please try again later.",
      });
      return;
    }

    // Single-account mode: login by email only
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      // SECURITY: Don't reveal if email exists; log internally for debugging
      logger.warn(`Login failed: user not found for ${normalizedEmail}`);
      recordFailedLoginAttempt(normalizedEmail);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      // SECURITY: Track failed attempt; log internally for debugging
      logger.warn(`Login failed: bad password for ${normalizedEmail}`);
      recordFailedLoginAttempt(normalizedEmail);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // SECURITY: Clear failed attempts on successful login
    clearFailedLoginAttempts(normalizedEmail);

    // Log login event
    logger.info(`User login: ${normalizedEmail}`);
    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
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
        profilePhoto: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, phone, city, address, pincode } = req.body;
    const userId = req.user!.id;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
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
        profilePhoto: true,
        createdAt: true,
      },
    });

    logger.info(`User profile updated: ${updatedUser.email}`);

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const updateProfilePhoto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    // Get file URL (relative path for serving via static middleware)
    const profilePhotoUrl = `/uploads/${req.file.filename}`;

    // Update user profile photo
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePhoto: profilePhotoUrl,
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
        profilePhoto: true,
        createdAt: true,
      },
    });

    logger.info(`User profile photo updated: ${updatedUser.email}`);

    res.json({
      message: "Profile photo updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;

    // Always respond with success to prevent email enumeration
    const successMessage =
      "If an account with that email exists, a password reset link has been sent.";

    // Look for USER role account first, then any account with that email
    const user = await findUserByEmail(email, "USER");
    if (!user) {
      // Don't reveal whether email exists
      logger.info(`Password reset requested for non-existent email: ${email}`);
      res.json({ message: successMessage });
      return;
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    // Store hashed token in DB (never store raw token)
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiry,
      },
    });

    // Send email with the raw token (user clicks link with this)
    await sendPasswordResetEmail(user.email, rawToken);

    logger.info(`Password reset email sent to: ${email}`);
    res.json({ message: successMessage });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors,
      });
      return;
    }

    // Hash and save new password, clear reset token
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Clear any failed login attempts for this user
    clearFailedLoginAttempts(user.email);

    logger.info(`Password reset successful for: ${user.email}`);
    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify current password
    const isValidPassword = await comparePassword(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({
        message: "New password does not meet security requirements",
        errors: passwordValidation.errors,
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed for user: ${user.email}`);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
