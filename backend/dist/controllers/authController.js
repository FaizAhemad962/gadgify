"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.resendVerificationEmail = exports.verifyEmail = exports.updateProfilePhoto = exports.updateProfile = exports.getProfile = exports.login = exports.signup = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../utils/auth");
const email_1 = require("../utils/email");
const securityValidator_1 = require("../middlewares/securityValidator");
const logger_1 = __importDefault(require("../utils/logger"));
const tokenBlacklist_1 = require("../utils/tokenBlacklist");
const auditLog_1 = require("../utils/auditLog");
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
        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();
        // SECURITY: Validate password strength
        const passwordValidation = (0, securityValidator_1.validatePasswordStrength)(password);
        if (!passwordValidation.valid) {
            res.status(400).json({
                message: "Password does not meet security requirements",
                errors: passwordValidation.errors,
            });
            return;
        }
        // Single-account mode: one email can have only one account
        const emailAlreadyRegistered = await (0, userQueryHelper_1.isEmailRegisteredWithAnyRole)(normalizedEmail);
        if (emailAlreadyRegistered) {
            res.status(400).json({ message: "Email already registered" });
            return;
        }
        // Hash password (bcrypt with proper salt rounds)
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // ✅ SECURITY: Generate email verification token
        const { token: verificationToken, hash: tokenHash, expiresAt, } = (0, auth_1.generateEmailVerificationToken)();
        // Create user with proper error handling
        let user;
        try {
            user = await database_1.default.user.create({
                data: {
                    email: normalizedEmail,
                    password: hashedPassword,
                    name,
                    phone,
                    state,
                    city,
                    address,
                    pincode,
                    // Store hashed token (never plain text)
                    emailVerificationToken: tokenHash,
                    emailVerificationTokenExpiry: expiresAt,
                    emailVerified: false,
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
                    emailVerified: true,
                    createdAt: true,
                },
            });
        }
        catch (createError) {
            // Handle unique constraint violations that might slip through
            if (createError.code === "P2002" ||
                createError.message.includes("Unique constraint failed")) {
                logger_1.default.warn(`Signup failed: Email already exists: ${normalizedEmail}`);
                res.status(400).json({ message: "Email already registered" });
                return;
            }
            throw createError;
        }
        // Send verification email (non-blocking)
        (0, email_1.sendEmailVerificationEmail)(normalizedEmail, verificationToken, name).catch((err) => logger_1.default.error(`Verification email failed for ${normalizedEmail}: ${err instanceof Error ? err.message : String(err)}`));
        // Also send welcome email
        (0, email_1.sendWelcomeEmail)(normalizedEmail, name).catch((err) => logger_1.default.error(`Welcome email failed for ${normalizedEmail}: ${err.message}`));
        // Generate token (user can access account, but with limited permissions until verified)
        const token = (0, auth_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        // SECURITY: Set httpOnly cookie for new signup (httpOnly = not accessible via JavaScript)
        const oneDay = 24 * 60 * 60 * 1000;
        res.setHeader("Set-Cookie", `authToken=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${oneDay / 1000}`);
        logger_1.default.info(`User signup: ${normalizedEmail} (email verification pending)`);
        // ✅ SECURITY: Log signup event
        const ipAddress = (0, auditLog_1.getIpAddress)(req);
        const userAgent = (0, auditLog_1.getUserAgent)(req);
        await (0, auditLog_1.logAuditEvent)({
            userId: user.id,
            email: normalizedEmail,
            action: auditLog_1.AuditAction.SIGNUP,
            description: `New account created from ${ipAddress}`,
            ipAddress,
            userAgent,
            status: "SUCCESS",
        });
        // IMPORTANT: Do NOT return token in response body
        res.status(201).json({
            success: true,
            message: "Signup successful. Please verify your email.",
            user,
            // Token is now in httpOnly cookie - NOT in response body
        });
    }
    catch (error) {
        logger_1.default.error(`Signup error: ${error instanceof Error ? error.message : String(error)}`);
        next(error);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const ipAddress = (0, auditLog_1.getIpAddress)(req);
        const userAgent = (0, auditLog_1.getUserAgent)(req);
        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();
        // SECURITY: Check if account is locked
        if (isAccountLocked(normalizedEmail)) {
            logger_1.default.warn(`Login attempt on locked account: ${normalizedEmail}`);
            // Log the failed attempt
            await (0, auditLog_1.logSecurityEvent)("unknown", normalizedEmail, auditLog_1.AuditAction.ACCOUNT_LOCKED, "Too many failed login attempts", ipAddress, userAgent);
            res.status(429).json({
                message: "Too many failed login attempts. Please try again later.",
            });
            return;
        }
        // Single-account mode: login by email only
        const user = await (0, userQueryHelper_1.findUserByEmail)(normalizedEmail);
        if (!user) {
            // SECURITY: Don't reveal if email exists; log internally for debugging
            logger_1.default.warn(`Login failed: user not found for ${normalizedEmail}`);
            recordFailedLoginAttempt(normalizedEmail);
            // Log the failed attempt
            await (0, auditLog_1.logSecurityEvent)("unknown", normalizedEmail, auditLog_1.AuditAction.FAILED_LOGIN, "User not found", ipAddress, userAgent);
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        // Verify password
        const isValidPassword = await (0, auth_1.comparePassword)(password, user.password);
        if (!isValidPassword) {
            // SECURITY: Track failed attempt; log internally for debugging
            logger_1.default.warn(`Login failed: bad password for ${normalizedEmail}`);
            recordFailedLoginAttempt(normalizedEmail);
            // Log the failed attempt
            await (0, auditLog_1.logSecurityEvent)(user.id, normalizedEmail, auditLog_1.AuditAction.FAILED_LOGIN, "Invalid password", ipAddress, userAgent);
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        // SECURITY: Clear failed attempts on successful login
        clearFailedLoginAttempts(normalizedEmail);
        // Generate token
        const token = (0, auth_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        // SECURITY: Set httpOnly cookie (httpOnly = not accessible via JavaScript, Secure = HTTPS only)
        const oneDay = 24 * 60 * 60 * 1000;
        res.setHeader("Set-Cookie", `authToken=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${oneDay / 1000}`);
        const { password: _, ...userWithoutPassword } = user;
        // Log successful login
        await (0, auditLog_1.logAuditEvent)({
            userId: user.id,
            email: normalizedEmail,
            action: auditLog_1.AuditAction.LOGIN,
            description: `Login successful from ${ipAddress}`,
            ipAddress,
            userAgent,
            status: "SUCCESS",
        });
        // IMPORTANT: Do NOT return token in response body anymore
        // Token is now set in httpOnly cookie
        // Frontend should not store or manage tokens - cookies are automatic
        res.json({
            success: true,
            message: "Login successful",
            user: userWithoutPassword,
            // Token is now in httpOnly cookie - NOT in response body
        });
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
/**
 * ✅ SECURITY: Verify email address
 * Validates the email verification token and marks user as verified
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: "Verification token is required" });
            return;
        }
        // Hash the provided token to match with stored hash
        const tokenHash = (0, auth_1.hashEmailToken)(token);
        // Find user with matching verification token
        const user = await database_1.default.user.findFirst({
            where: {
                emailVerificationToken: tokenHash,
                emailVerificationTokenExpiry: {
                    gt: new Date(), // Token not expired
                },
                emailVerified: false,
            },
        });
        if (!user) {
            logger_1.default.warn(`Email verification failed: Invalid or expired token`);
            res.status(400).json({
                message: "Invalid or expired verification token. Please request a new one.",
            });
            return;
        }
        // Update user as verified
        const updatedUser = await database_1.default.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationToken: null,
                emailVerificationTokenExpiry: null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
            },
        });
        logger_1.default.info(`Email verified: ${updatedUser.email}`);
        // ✅ SECURITY: Log email verification event
        const ipAddress = (0, auditLog_1.getIpAddress)(req);
        const userAgent = (0, auditLog_1.getUserAgent)(req);
        await (0, auditLog_1.logAuditEvent)({
            userId: updatedUser.id,
            email: updatedUser.email,
            action: auditLog_1.AuditAction.EMAIL_VERIFIED,
            description: `Email verified from ${ipAddress}`,
            ipAddress,
            userAgent,
            status: "SUCCESS",
        });
        res.json({
            success: true,
            message: "Email verified successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
/**
 * ✅ SECURITY: Resend verification email
 * Used when user didn't receive the email or token expired
 */
const resendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        // Find user
        const user = await database_1.default.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!user) {
            // Don't reveal if email exists (security)
            res.json({
                message: "If the email exists, a verification link has been sent.",
            });
            return;
        }
        // If already verified, no need to resend
        if (user.emailVerified) {
            res.status(400).json({
                message: "Email is already verified",
            });
            return;
        }
        // Generate new verification token
        const { token: verificationToken, hash: tokenHash, expiresAt, } = (0, auth_1.generateEmailVerificationToken)();
        // Update user with new token
        await database_1.default.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken: tokenHash,
                emailVerificationTokenExpiry: expiresAt,
            },
        });
        // Send verification email
        await (0, email_1.sendEmailVerificationEmail)(normalizedEmail, verificationToken, user.name);
        logger_1.default.info(`Verification email resent to: ${normalizedEmail}`);
        res.json({
            success: true,
            message: "Verification email has been sent. Please check your inbox.",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resendVerificationEmail = resendVerificationEmail;
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
/**
 * Logout endpoint
 * Clears the authentication cookie
 */
const logout = async (req, res, next) => {
    try {
        // ✅ SECURITY: Get token from cookie or header and blacklist it
        let token = req.cookies?.authToken;
        if (!token) {
            token = req.headers.authorization?.replace("Bearer ", "");
        }
        // Blacklist the token (prevent reuse)
        if (token) {
            try {
                // JWT expires in 24 hours by default, blacklist for the same duration
                const jwtExpireMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                await (0, tokenBlacklist_1.blacklistToken)(token, jwtExpireMs);
            }
            catch (error) {
                logger_1.default.warn(`Failed to blacklist token during logout: ${error instanceof Error ? error.message : String(error)}`);
                // Continue with logout even if blacklist fails
            }
        }
        // Clear the httpOnly cookie by setting it to expire immediately
        res.setHeader("Set-Cookie", "authToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0");
        // ✅ SECURITY: Log logout event
        const ipAddress = (0, auditLog_1.getIpAddress)(req);
        const userAgent = (0, auditLog_1.getUserAgent)(req);
        await (0, auditLog_1.logAuditEvent)({
            userId: req.user?.id || "unknown",
            email: req.user?.email || "unknown",
            action: auditLog_1.AuditAction.LOGOUT,
            description: `Logout from ${ipAddress}`,
            ipAddress,
            userAgent,
            status: "SUCCESS",
        });
        logger_1.default.info(`User logout: ${req.user?.email}`);
        res.json({
            success: true,
            message: "Logout successful",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
