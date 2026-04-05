"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAccountsGrouped = exports.getMultiAccountStats = exports.hasMultipleAccounts = exports.createAdditionalAccount = exports.getAccountsByEmail = void 0;
const multiAccountService_1 = __importDefault(require("../services/multiAccountService"));
const auth_1 = require("../utils/auth");
const getAccountsByEmail = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        const accounts = await multiAccountService_1.default.getAccountsByEmail(req.user.email);
        res.json({
            success: true,
            message: "Accounts fetched",
            data: {
                email: req.user.email,
                totalAccounts: accounts.length,
                accounts,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAccountsByEmail = getAccountsByEmail;
const createAdditionalAccount = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        const { password, role, name, phone, city, state, address, pincode, accountName, } = req.body;
        // Validate role
        const validRoles = [
            "USER",
            "ADMIN",
            "SUPER_ADMIN",
            "DELIVERY_STAFF",
            "SUPPORT_STAFF",
        ];
        if (!validRoles.includes(role)) {
            res.status(400).json({ success: false, message: "Invalid role" });
            return;
        }
        // Check if user already has this role
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const newAccount = await multiAccountService_1.default.createAccountForEmail(req.user.email, hashedPassword, role, name, phone, city, state, address, pincode, accountName);
        res.status(201).json({
            success: true,
            message: "Additional account created successfully",
            data: newAccount,
        });
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("already exists")) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        next(error);
    }
};
exports.createAdditionalAccount = createAdditionalAccount;
const hasMultipleAccounts = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        const hasMultiple = await multiAccountService_1.default.hasMultipleAccounts(req.user.email);
        const count = await multiAccountService_1.default.getAccountCount(req.user.email);
        res.json({
            success: true,
            message: "Account check completed",
            data: {
                email: req.user.email,
                hasMultipleAccounts: hasMultiple,
                totalAccounts: count,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.hasMultipleAccounts = hasMultipleAccounts;
const getMultiAccountStats = async (req, res, next) => {
    try {
        // Only admins can view stats
        if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        const stats = await multiAccountService_1.default.getMultiAccountStats();
        res.json({
            success: true,
            message: "Multi-account statistics",
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMultiAccountStats = getMultiAccountStats;
const getAllAccountsGrouped = async (req, res, next) => {
    try {
        // Only admins can view all accounts
        if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        const grouped = await multiAccountService_1.default.getAllAccountsGroupedByEmail();
        res.json({
            success: true,
            message: "All accounts grouped by email",
            data: grouped,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllAccountsGrouped = getAllAccountsGrouped;
