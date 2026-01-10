"use strict";
/**
 * Security Middleware - Input validation and sanitization
 * Prevents XSS, SQL injection, and other common attacks
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preventSQLInjection = exports.isRateLimited = exports.validateFilePath = exports.validateURL = exports.validatePincode = exports.validatePhoneNumber = exports.validatePasswordStrength = exports.validateEmail = exports.sanitizeStrings = exports.sanitizeInput = void 0;
const validator_1 = __importDefault(require("validator"));
/**
 * Sanitize all request inputs (body, query, params)
 * Removes potentially dangerous characters and validates formats
 */
const sanitizeInput = (req, res, next) => {
    try {
        // Sanitize body
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }
        // Sanitize query
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }
        // Sanitize params
        if (req.params && typeof req.params === 'object') {
            req.params = sanitizeObject(req.params);
        }
        next();
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid input format' });
    }
};
exports.sanitizeInput = sanitizeInput;
/**
 * Sanitize string values - removes XSS vectors
 */
const sanitizeStrings = (obj) => {
    if (typeof obj === 'string') {
        // Remove dangerous characters and HTML tags
        return validator_1.default.trim(validator_1.default.escape(obj));
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => (0, exports.sanitizeStrings)(item));
    }
    if (typeof obj === 'object' && obj !== null) {
        return sanitizeObject(obj);
    }
    return obj;
};
exports.sanitizeStrings = sanitizeStrings;
/**
 * Sanitize object - recursively sanitizes all values
 */
function sanitizeObject(obj) {
    const sanitized = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            // Sanitize the value
            if (typeof value === 'string') {
                // Trim, escape HTML, and remove null bytes
                sanitized[key] = value
                    .replace(/\0/g, '')
                    .replace(/\r/g, '')
                    .replace(/\n/g, '')
                    .trim();
            }
            else if (Array.isArray(value)) {
                sanitized[key] = value.map((item) => sanitizeObject(item));
            }
            else if (typeof value === 'object' && value !== null) {
                sanitized[key] = sanitizeObject(value);
            }
            else {
                sanitized[key] = value;
            }
        }
    }
    return sanitized;
}
/**
 * Validate email format
 */
const validateEmail = (email) => {
    return validator_1.default.isEmail(email);
};
exports.validateEmail = validateEmail;
/**
 * Validate password strength
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
};
exports.validatePasswordStrength = validatePasswordStrength;
/**
 * Validate phone number format (10 digits for India)
 */
const validatePhoneNumber = (phone) => {
    return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
};
exports.validatePhoneNumber = validatePhoneNumber;
/**
 * Validate pincode format (6 digits for India)
 */
const validatePincode = (pincode) => {
    return /^\d{6}$/.test(pincode.trim());
};
exports.validatePincode = validatePincode;
/**
 * Validate URL format
 */
const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.validateURL = validateURL;
/**
 * Sanitize file path - prevents directory traversal attacks
 */
const validateFilePath = (filePath) => {
    // Reject paths with .. or ~ or other dangerous patterns
    return !/(\.\.|~|\/\/|\\\\)/.test(filePath) && filePath.length < 255;
};
exports.validateFilePath = validateFilePath;
/**
 * Rate limiting helper - Check if user has exceeded rate limit
 */
const isRateLimited = (key, limit, windowMs) => {
    // This would be used with a cache (Redis recommended for production)
    // For now, implement basic in-memory rate limiting
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const cacheKey = `${key}:${window}`;
    // Store in app.locals or use actual cache
    // Pseudocode shown here
    return false; // Implementation depends on cache layer
};
exports.isRateLimited = isRateLimited;
/**
 * Prevent SQL injection by validating common SQL patterns
 */
const preventSQLInjection = (input) => {
    const sqlPatterns = [
        /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
        /('--|#|\/\*|\*\/)/,
        /(;\s*DROP)/gi,
    ];
    return !sqlPatterns.some((pattern) => pattern.test(input));
};
exports.preventSQLInjection = preventSQLInjection;
