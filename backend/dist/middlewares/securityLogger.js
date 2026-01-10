"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSecurityEvents = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const logSecurityEvents = (req, res, next) => {
    // Log failed auth attempts
    res.on('finish', () => {
        const authReq = req;
        // Failed login attempts
        if (req.path.includes('/auth/login') && res.statusCode === 401) {
            logger_1.default.warn('Failed login attempt', {
                ip: req.ip,
                email: req.body.email,
                userAgent: req.get('user-agent'),
                timestamp: new Date().toISOString(),
            });
        }
        // Successful login
        if (req.path.includes('/auth/login') && res.statusCode === 200) {
            logger_1.default.info('Successful login', {
                ip: req.ip,
                email: req.body.email,
                timestamp: new Date().toISOString(),
            });
        }
        // Admin actions
        if (req.path.includes('/admin') && res.statusCode < 400) {
            logger_1.default.info('Admin action', {
                user: authReq.user?.email,
                method: req.method,
                path: req.path,
                ip: req.ip,
                timestamp: new Date().toISOString(),
            });
        }
        // Failed authorization attempts
        if (res.statusCode === 403) {
            logger_1.default.warn('Authorization denied', {
                user: authReq.user?.email,
                path: req.path,
                ip: req.ip,
                timestamp: new Date().toISOString(),
            });
        }
        // Payment/Order events
        if ((req.path.includes('/payment') || req.path.includes('/order')) && authReq.user) {
            logger_1.default.info('Payment/Order event', {
                user: authReq.user.email,
                method: req.method,
                path: req.path,
                status: res.statusCode,
                timestamp: new Date().toISOString(),
            });
        }
        // Suspicious activity (429 Too Many Requests)
        if (res.statusCode === 429) {
            logger_1.default.warn('Rate limit exceeded', {
                ip: req.ip,
                path: req.path,
                userAgent: req.get('user-agent'),
                timestamp: new Date().toISOString(),
            });
        }
    });
    next();
};
exports.logSecurityEvents = logSecurityEvents;
