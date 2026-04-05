"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roleChangeController_1 = require("../controllers/roleChangeController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const validators_1 = require("../validators");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Check if current user can change roles
router.get("/check-permission", roleChangeController_1.checkRoleChangePermission);
// Get permission for a specific user (admin only or self)
router.get("/permissions/:userId", roleChangeController_1.getUserPermission);
// Admin and Super Admin routes
router.use((0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"));
// Get all permissions
router.get("/permissions", roleChangeController_1.getAllPermissions);
// Grant role change permission to a user
router.post("/grant", (0, validate_1.validate)(validators_1.grantRoleChangePermissionSchema), roleChangeController_1.grantRoleChangePermission);
// Revoke role change permission from a user
router.delete("/revoke/:userId", roleChangeController_1.revokeRoleChangePermission);
// Change a user's role (requires role change permission)
router.patch("/change-role/:userId", (0, validate_1.validate)(validators_1.changeUserRoleSchema), roleChangeController_1.changeUserRole);
exports.default = router;
