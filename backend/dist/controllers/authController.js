"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.updateProfilePhoto = exports.updateProfile = exports.getProfile = exports.login = exports.signup = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../utils/auth");
const email_1 = require("../utils/email");
const securityValidator_1 = require("../middlewares/securityValidator");
const logger_1 = __importDefault(require("../utils/logger"));
const userQueryHelper_1 = require("../utils/userQueryHelper");
// SECURITY: Track failed login attempts (use Redis in production)
const failedLoginAttempts = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
/**
 * Check if account is locked due to failed attempts
 */
const isAccountLocked = (email) => {
    const attempts = failedLoginAttempts.get(email);
    if (!attempts)
        return false;
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
const recordFailedLoginAttempt = (email) => {
    const attempts = failedLoginAttempts.get(email) || {
        count: 0,
        timestamp: Date.now(),
    };
    attempts.count++;
    attempts.timestamp = Date.now();
    failedLoginAttempts.set(email, attempts);
    if (attempts.count >= MAX_FAILED_ATTEMPTS) {
        logger_1.default.warn(`Account locked: ${email} after ${MAX_FAILED_ATTEMPTS} failed attempts`);
    }
};
/**
 * Clear failed login attempts
 */
const clearFailedLoginAttempts = (email) => {
    failedLoginAttempts.delete(email);
};
const signup = async (req, res, next) => {
    try {
        const { email, password, name, phone, state, city, address, pincode } = req.body;
        // SECURITY: Validate password strength
        const passwordValidation = (0, securityValidator_1.validatePasswordStrength)(password);
        if (!passwordValidation.valid) {
            res.status(400).json({
                message: "Password does not meet security requirements",
                errors: passwordValidation.errors,
            });
            return;
        }
        // Check if user exists with email + USER role
        const existingUser = await (0, userQueryHelper_1.findUserByEmail)(email, "USER");
        if (existingUser && existingUser.role === "USER") {
            res
                .status(400)
                .json({ message: "Email already registered as a user account" });
            return;
        }
        // Hash password (bcrypt with proper salt rounds)
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Create user
        const user = await database_1.default.user.create({
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
                profilePhoto: true,
                createdAt: true,
            },
        });
        // Log signup event
        logger_1.default.info(`User signup: ${email}`);
        // Send welcome email (non-blocking)
        (0, email_1.sendWelcomeEmail)(email, name).catch((err) => logger_1.default.error(`Welcome email failed for ${email}: ${err.message}`));
        // Generate token
        const token = (0, auth_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({ token, user });
    }
    catch (error) {
        next(error);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        // SECURITY: Check if account is locked
        if (isAccountLocked(email)) {
            logger_1.default.warn(`Login attempt on locked account: ${email}`);
            res.status(429).json({
                message: "Too many failed login attempts. Please try again later.",
            });
            return;
        }
        // Find user - if role provided, use it; otherwise default to USER
        const user = await (0, userQueryHelper_1.findUserByEmail)(email, role || "USER");
        if (!user) {
            // SECURITY: Don't reveal if email exists; log internally for debugging
            logger_1.default.warn(`Login failed: user not found for ${email}`);
            recordFailedLoginAttempt(email);
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        // Verify password
        const isValidPassword = await (0, auth_1.comparePassword)(password, user.password);
        if (!isValidPassword) {
            // SECURITY: Track failed attempt; log internally for debugging
            logger_1.default.warn(`Login failed: bad password for ${email}`);
            recordFailedLoginAttempt(email);
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        // SECURITY: Clear failed attempts on successful login
        clearFailedLoginAttempts(email);
        // Log login event
        logger_1.default.info(`User login: ${email}`);
        // Generate token
        const token = (0, auth_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getProfile = async (req, res, next) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
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
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, city, address, pincode } = req.body;
        const userId = req.user.id;
        // Update user profile
        const updatedUser = await database_1.default.user.update({
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
        logger_1.default.info(`User profile updated: ${updatedUser.email}`);
        res.json({ message: "Profile updated successfully", user: updatedUser });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const updateProfilePhoto = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            res.status(400).json({ message: "No image file provided" });
            return;
        }
        // Get file URL (relative path for serving via static middleware)
        const profilePhotoUrl = `/uploads/${req.file.filename}`;
        // Update user profile photo
        const updatedUser = await database_1.default.user.update({
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
        logger_1.default.info(`User profile photo updated: ${updatedUser.email}`);
        res.json({
            message: "Profile photo updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfilePhoto = updateProfilePhoto;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        // Always respond with success to prevent email enumeration
        const successMessage = "If an account with that email exists, a password reset link has been sent.";
        // Look for USER role account first, then any account with that email
        const user = await (0, userQueryHelper_1.findUserByEmail)(email, "USER");
        if (!user) {
            // Don't reveal whether email exists
            logger_1.default.info(`Password reset requested for non-existent email: ${email}`);
            res.json({ message: successMessage });
            return;
        }
        // Generate a secure random token
        const rawToken = crypto_1.default.randomBytes(32).toString("hex");
        // Store hashed token in DB (never store raw token)
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry: expiry,
            },
        });
        // Send email with the raw token (user clicks link with this)
        await (0, email_1.sendPasswordResetEmail)(user.email, rawToken);
        logger_1.default.info(`Password reset email sent to: ${email}`);
        res.json({ message: successMessage });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        // Hash the incoming token to compare with stored hash
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const user = await database_1.default.user.findFirst({
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
        const passwordValidation = (0, securityValidator_1.validatePasswordStrength)(newPassword);
        if (!passwordValidation.valid) {
            res.status(400).json({
                message: "Password does not meet security requirements",
                errors: passwordValidation.errors,
            });
            return;
        }
        // Hash and save new password, clear reset token
        const hashedPassword = await (0, auth_1.hashPassword)(newPassword);
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        // Clear any failed login attempts for this user
        clearFailedLoginAttempts(user.email);
        logger_1.default.info(`Password reset successful for: ${user.email}`);
        res.json({ message: "Password has been reset successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        // Get user with password
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Verify current password
        const isValidPassword = await (0, auth_1.comparePassword)(currentPassword, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: "Current password is incorrect" });
            return;
        }
        // Validate new password strength
        const passwordValidation = (0, securityValidator_1.validatePasswordStrength)(newPassword);
        if (!passwordValidation.valid) {
            res.status(400).json({
                message: "New password does not meet security requirements",
                errors: passwordValidation.errors,
            });
            return;
        }
        // Hash new password
        const hashedPassword = await (0, auth_1.hashPassword)(newPassword);
        // Update password
        await database_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        logger_1.default.info(`Password changed for user: ${user.email}`);
        res.json({ message: "Password changed successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
