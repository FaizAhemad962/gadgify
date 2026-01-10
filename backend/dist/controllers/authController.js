"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfilePhoto = exports.updateProfile = exports.getProfile = exports.login = exports.signup = void 0;
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../utils/auth");
const securityValidator_1 = require("../middlewares/securityValidator");
const logger_1 = __importDefault(require("../utils/logger"));
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
    const attempts = failedLoginAttempts.get(email) || { count: 0, timestamp: Date.now() };
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
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors,
            });
            return;
        }
        // Check if user exists
        const existingUser = await database_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
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
        // Generate token
        const token = (0, auth_1.generateToken)({ id: user.id, email: user.email, role: user.role });
        res.status(201).json({ token, user });
    }
    catch (error) {
        next(error);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // SECURITY: Check if account is locked
        if (isAccountLocked(email)) {
            logger_1.default.warn(`Login attempt on locked account: ${email}`);
            res.status(429).json({
                message: 'Too many failed login attempts. Please try again later.',
            });
            return;
        }
        // Find user
        const user = await database_1.default.user.findUnique({ where: { email } });
        if (!user) {
            // SECURITY: Don't reveal if email exists
            recordFailedLoginAttempt(email);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Verify password
        const isValidPassword = await (0, auth_1.comparePassword)(password, user.password);
        if (!isValidPassword) {
            // SECURITY: Track failed attempt
            recordFailedLoginAttempt(email);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // SECURITY: Clear failed attempts on successful login
        clearFailedLoginAttempts(email);
        // Log login event
        logger_1.default.info(`User login: ${email}`);
        // Generate token
        const token = (0, auth_1.generateToken)({ id: user.id, email: user.email, role: user.role });
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
            res.status(404).json({ message: 'User not found' });
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
        res.json({ message: 'Profile updated successfully', user: updatedUser });
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
            res.status(400).json({ message: 'No image file provided' });
            return;
        }
        // Get Cloudinary URL from multer upload
        const profilePhotoUrl = req.file.path;
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
        res.json({ message: 'Profile photo updated successfully', user: updatedUser });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfilePhoto = updateProfilePhoto;
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        // Get user with password
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Verify current password
        const isValidPassword = await (0, auth_1.comparePassword)(currentPassword, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Current password is incorrect' });
            return;
        }
        // Validate new password strength
        const passwordValidation = (0, securityValidator_1.validatePasswordStrength)(newPassword);
        if (!passwordValidation.valid) {
            res.status(400).json({
                message: 'New password does not meet security requirements',
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
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
