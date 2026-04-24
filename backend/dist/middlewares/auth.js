"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const database_1 = __importDefault(require("../config/database"));
const tokenBlacklist_1 = require("../utils/tokenBlacklist");
const authenticate = async (req, res, next) => {
    try {
        // SECURITY: Try to get token from httpOnly cookie first (more secure)
        // Fallback to Authorization header for backward compatibility with mobile clients
        let token = req.cookies?.authToken;
        // Fallback to Authorization header (for API clients, mobile apps)
        if (!token) {
            token = req.headers.authorization?.replace("Bearer ", "");
        }
        if (!token) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }
        // ✅ SECURITY: Check if token is blacklisted (logged out)
        const blacklisted = await (0, tokenBlacklist_1.isTokenBlacklisted)(token);
        if (blacklisted) {
            res
                .status(401)
                .json({ message: "Token expired or revoked. Please login again." });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        // Verify user still exists
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
