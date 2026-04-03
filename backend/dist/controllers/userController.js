"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteUser = exports.updateUserRole = exports.getAllUsers = void 0;
const database_1 = __importDefault(require("../config/database"));
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
