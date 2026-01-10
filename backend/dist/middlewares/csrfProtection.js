"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredTokens = exports.verifyCsrfToken = exports.csrfTokenGenerator = exports.generateCSRFToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Store CSRF tokens in memory (use Redis in production)
const csrfTokenStore = new Map();
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const generateCSRFToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateCSRFToken = generateCSRFToken;
const csrfTokenGenerator = (req, res, next) => {
    // Safely derive an identifier
    const sessionId = req.sessionID ||
        req.user?.id ||
        req.ip;
    const token = (0, exports.generateCSRFToken)();
    csrfTokenStore.set(token, {
        timestamp: Date.now(),
    });
    res.locals.csrfToken = token;
    req.csrfToken = token;
    next();
};
exports.csrfTokenGenerator = csrfTokenGenerator;
const verifyCsrfToken = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    const token = req.headers['x-csrf-token'] ||
        req.body?.csrfToken;
    if (!token) {
        return res.status(403).json({ message: 'CSRF token is required' });
    }
    const stored = csrfTokenStore.get(token);
    if (!stored) {
        return res.status(403).json({ message: 'Invalid or expired CSRF token' });
    }
    if (Date.now() - stored.timestamp > TOKEN_EXPIRY) {
        csrfTokenStore.delete(token);
        return res.status(403).json({ message: 'CSRF token has expired' });
    }
    csrfTokenStore.delete(token);
    next();
};
exports.verifyCsrfToken = verifyCsrfToken;
const cleanupExpiredTokens = () => {
    setInterval(() => {
        const now = Date.now();
        for (const [token, data] of csrfTokenStore.entries()) {
            if (now - data.timestamp > TOKEN_EXPIRY) {
                csrfTokenStore.delete(token);
            }
        }
    }, 60 * 60 * 1000);
};
exports.cleanupExpiredTokens = cleanupExpiredTokens;
