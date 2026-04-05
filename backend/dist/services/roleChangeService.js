"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleChangeService = exports.ALL_ROLES = void 0;
const database_1 = __importDefault(require("../config/database"));
const userQueryHelper_1 = require("../utils/userQueryHelper");
// Role hierarchy: USER (0) < SUPPORT_STAFF (1) < DELIVERY_STAFF (1) < ADMIN (2) < SUPER_ADMIN (3)
const ROLE_HIERARCHY = {
    USER: 0,
    SUPPORT_STAFF: 1,
    DELIVERY_STAFF: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
};
exports.ALL_ROLES = Object.keys(ROLE_HIERARCHY);
class RoleChangeService {
    /**
     * Get role level for hierarchy comparison
     */
    getRoleLevel(role) {
        return ROLE_HIERARCHY[role] ?? -1;
    }
    /**
     * Check if a user has higher or equal role than another
     */
    hasHigherOrEqualRole(userRole, targetRole) {
        return this.getRoleLevel(userRole) >= this.getRoleLevel(targetRole);
    }
    /**
     * Grant permission to a user to change roles
     * Only SUPER_ADMIN can grant permissions
     */
    async grantRoleChangePermission(grantedById, grantedToEmail, canRemovePermission = false) {
        // Verify the grantedBy user is a SUPER_ADMIN
        const grantor = await database_1.default.user.findUnique({
            where: { id: grantedById },
            select: { id: true, role: true, email: true, deletedAt: true },
        });
        if (!grantor || grantor.deletedAt) {
            throw new Error("Grantor user not found");
        }
        // Only SUPER_ADMIN can grant permissions
        if (grantor.role !== "SUPER_ADMIN") {
            throw new Error("Only SUPER_ADMIN can grant role change permissions");
        }
        // Find the user to grant permission to (select first/primary account if multiple exist)
        const usersToGrant = await (0, userQueryHelper_1.findAllAccountsByEmail)(grantedToEmail);
        const userToGrant = usersToGrant.length > 0 ? usersToGrant[0] : null;
        // Enhance with full user data
        const fullUserToGrant = userToGrant
            ? await database_1.default.user.findUnique({
                where: { id: userToGrant.id },
                select: { id: true, email: true, role: true, deletedAt: true },
            })
            : null;
        if (!fullUserToGrant || fullUserToGrant.deletedAt) {
            throw new Error("User to grant permission not found");
        }
        // Check if permission already exists for this user
        const existingPermission = await database_1.default.roleChangePermission.findUnique({
            where: { grantedToId: fullUserToGrant.id },
            select: { id: true, deletedAt: true },
        });
        if (existingPermission && !existingPermission.deletedAt) {
            throw new Error("User already has role change permission");
        }
        // Create or update the permission
        const permission = await database_1.default.roleChangePermission.upsert({
            where: { grantedToId: fullUserToGrant.id },
            update: {
                grantedById,
                canChangeRoles: true,
                canRemovePermission,
                isActive: true,
                deletedAt: null,
                updatedAt: new Date(),
            },
            create: {
                grantedById,
                grantedToId: fullUserToGrant.id,
                canChangeRoles: true,
                canRemovePermission,
                isActive: true,
            },
            include: {
                grantedBy: {
                    select: { id: true, email: true, name: true, role: true },
                },
                grantedTo: {
                    select: { id: true, email: true, name: true, role: true },
                },
            },
        });
        return permission;
    }
    /**
     * Revoke role change permission from a user
     */
    async revokeRoleChangePermission(revokedById, grantedToId) {
        // Verify the revokedBy user is an ADMIN
        const revoker = await database_1.default.user.findUnique({
            where: { id: revokedById },
            select: { id: true, role: true, deletedAt: true },
        });
        if (!revoker || revoker.deletedAt) {
            throw new Error("Revoker user not found");
        }
        if (revoker.role !== "ADMIN") {
            throw new Error("Only admins can revoke permissions");
        }
        // Find the permission to revoke
        const permission = await database_1.default.roleChangePermission.findUnique({
            where: { grantedToId },
        });
        if (!permission || permission.deletedAt) {
            throw new Error("Permission not found");
        }
        // Soft delete the permission
        const revoked = await database_1.default.roleChangePermission.update({
            where: { grantedToId },
            data: {
                isActive: false,
                deletedAt: new Date(),
            },
            include: {
                grantedTo: { select: { id: true, email: true, name: true } },
            },
        });
        return revoked;
    }
    /**
     * Check if a user can change roles
     */
    async canChangeRoles(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true, deletedAt: true },
        });
        if (!user || user.deletedAt) {
            return false;
        }
        // Admins can always change roles
        if (user.role === "ADMIN") {
            return true;
        }
        // Check if user has been granted permission
        const permission = await database_1.default.roleChangePermission.findUnique({
            where: { grantedToId: userId },
            select: { canChangeRoles: true, isActive: true, deletedAt: true },
        });
        return (!!permission &&
            permission.canChangeRoles &&
            permission.isActive &&
            !permission.deletedAt);
    }
    /**
     * Change a user's role (with authorization)
     */
    async changeUserRole(changedById, targetUserId, newRole) {
        // Verify the user changing the role has permission
        const canChange = await this.canChangeRoles(changedById);
        if (!canChange) {
            throw new Error("You do not have permission to change roles");
        }
        // Prevent self-role change
        if (changedById === targetUserId) {
            throw new Error("You cannot change your own role");
        }
        // Find the target user
        const targetUser = await database_1.default.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, email: true, deletedAt: true },
        });
        if (!targetUser || targetUser.deletedAt) {
            throw new Error("Target user not found");
        }
        // Update the user's role
        const updated = await database_1.default.user.update({
            where: { id: targetUserId },
            data: { role: newRole, updatedAt: new Date() },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        return updated;
    }
    /**
     * Get all role change permissions (only for admins)
     */
    async getAllPermissions(requesterId) {
        // Verify the requester is an ADMIN
        const requester = await database_1.default.user.findUnique({
            where: { id: requesterId },
            select: { role: true, deletedAt: true },
        });
        if (!requester || requester.deletedAt || requester.role !== "ADMIN") {
            throw new Error("Only admins can view permissions");
        }
        const permissions = await database_1.default.roleChangePermission.findMany({
            where: { deletedAt: null },
            include: {
                grantedBy: { select: { id: true, email: true, name: true } },
                grantedTo: {
                    select: { id: true, email: true, name: true, role: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return permissions;
    }
    /**
     * Get permissions for a specific user
     */
    async getUserPermission(userId, requesterId) {
        // Verify the requester is an ADMIN or requesting for themselves
        const requester = await database_1.default.user.findUnique({
            where: { id: requesterId },
            select: { role: true, deletedAt: true },
        });
        if (!requester || requester.deletedAt) {
            throw new Error("Requester not found");
        }
        if (requester.role !== "ADMIN" && requesterId !== userId) {
            throw new Error("You can only view your own permissions");
        }
        const permission = await database_1.default.roleChangePermission.findUnique({
            where: { grantedToId: userId },
            include: {
                grantedBy: { select: { id: true, email: true, name: true } },
                grantedTo: {
                    select: { id: true, email: true, name: true, role: true },
                },
            },
        });
        if (!permission || permission.deletedAt) {
            return null;
        }
        return permission;
    }
}
exports.RoleChangeService = RoleChangeService;
exports.default = new RoleChangeService();
