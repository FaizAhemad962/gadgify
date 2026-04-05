"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRoleChangePermission = exports.getUserPermission = exports.getAllPermissions = exports.changeUserRole = exports.revokeRoleChangePermission = exports.grantRoleChangePermission = void 0;
const roleChangeService_1 = __importDefault(require("../services/roleChangeService"));
const grantRoleChangePermission = async (req, res, next) => {
    try {
        const { email, canRemovePermission } = req.body;
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        const permission = await roleChangeService_1.default.grantRoleChangePermission(req.user.id, email, canRemovePermission || false);
        res.json({
            success: true,
            message: "Role change permission granted successfully",
            data: permission,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.grantRoleChangePermission = grantRoleChangePermission;
const revokeRoleChangePermission = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        const revoked = await roleChangeService_1.default.revokeRoleChangePermission(req.user.id, userId);
        res.json({
            success: true,
            message: "Role change permission revoked successfully",
            data: revoked,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.revokeRoleChangePermission = revokeRoleChangePermission;
const changeUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        const updated = await roleChangeService_1.default.changeUserRole(req.user.id, userId, role);
        res.json({
            success: true,
            message: "User role changed successfully",
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changeUserRole = changeUserRole;
const getAllPermissions = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        const permissions = await roleChangeService_1.default.getAllPermissions(req.user.id);
        res.json({
            success: true,
            message: "Permissions fetched successfully",
            data: permissions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPermissions = getAllPermissions;
const getUserPermission = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        const permission = await roleChangeService_1.default.getUserPermission(userId, req.user.id);
        res.json({
            success: true,
            message: "Permission fetched successfully",
            data: permission,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserPermission = getUserPermission;
const checkRoleChangePermission = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res
                .status(401)
                .json({ success: false, message: "Authentication required" });
            return;
        }
        const canChange = await roleChangeService_1.default.canChangeRoles(req.user.id);
        res.json({
            success: true,
            message: "Permission check completed",
            data: { canChangeRoles: canChange },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.checkRoleChangePermission = checkRoleChangePermission;
