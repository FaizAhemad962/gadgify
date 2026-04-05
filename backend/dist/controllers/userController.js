"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.softDeleteUser = exports.updateUserRole = exports.getAllUsers = void 0;
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../utils/auth");
const userQueryHelper_1 = require("../utils/userQueryHelper");
const getAllUsers = async (_req, res, next) => {
    try {
        const users = await database_1.default.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                state: true,
                city: true,
                createdAt: true,
                _count: { select: { orders: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, message: "Users fetched", data: users });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        // Prevent admin from changing their own role
        if (req.user?.id === id) {
            res
                .status(400)
                .json({ success: false, message: "Cannot change your own role" });
            return;
        }
        const user = await database_1.default.user.findUnique({ where: { id } });
        if (!user || user.deletedAt) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const updated = await database_1.default.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
        res.json({ success: true, message: "User role updated", data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
const softDeleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Prevent admin from deleting themselves
        if (req.user?.id === id) {
            res
                .status(400)
                .json({ success: false, message: "Cannot delete your own account" });
            return;
        }
        const user = await database_1.default.user.findUnique({ where: { id } });
        if (!user || user.deletedAt) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        await database_1.default.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        res.json({ success: true, message: "User deleted" });
    }
    catch (error) {
        next(error);
    }
};
exports.softDeleteUser = softDeleteUser;
const createUser = async (req, res, next) => {
    try {
        const { email, password, name, phone, role, state, city, address, pincode, } = req.body;
        // Only allow ADMIN and SUPER_ADMIN to create users
        if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        // SUPER_ADMIN can create any role, but ADMIN can only create DELIVERY_STAFF, SUPPORT_STAFF, and USER
        if (req.user.role === "ADMIN") {
            const allowedRoles = ["USER", "DELIVERY_STAFF", "SUPPORT_STAFF"];
            if (!allowedRoles.includes(role)) {
                res.status(403).json({
                    success: false,
                    message: "Admins can only create DELIVERY_STAFF, SUPPORT_STAFF, or USER roles",
                });
                return;
            }
        }
        // Check if user already exists with this email and role
        const userAlreadyExists = await (0, userQueryHelper_1.userExists)(email, role);
        if (userAlreadyExists) {
            res.status(400).json({
                success: false,
                message: `Email already registered as a ${role} account`,
            });
            return;
        }
        // Hash password
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Create user
        const newUser = await database_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role,
                state: state || "MAHARASHTRA",
                city: city || "",
                address: address || "",
                pincode: pincode || "",
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: newUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
