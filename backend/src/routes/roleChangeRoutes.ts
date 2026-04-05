import { Router } from "express";
import {
  grantRoleChangePermission,
  revokeRoleChangePermission,
  changeUserRole,
  getAllPermissions,
  getUserPermission,
  checkRoleChangePermission,
} from "../controllers/roleChangeController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  grantRoleChangePermissionSchema,
  changeUserRoleSchema,
} from "../validators";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Check if current user can change roles
router.get("/check-permission", checkRoleChangePermission);

// Get permission for a specific user (admin only or self)
router.get("/permissions/:userId", getUserPermission);

// Admin and Super Admin routes
router.use(authorize("ADMIN", "SUPER_ADMIN"));

// Get all permissions
router.get("/permissions", getAllPermissions);

// Grant role change permission to a user
router.post(
  "/grant",
  validate(grantRoleChangePermissionSchema),
  grantRoleChangePermission,
);

// Revoke role change permission from a user
router.delete("/revoke/:userId", revokeRoleChangePermission);

// Change a user's role (requires role change permission)
router.patch(
  "/change-role/:userId",
  validate(changeUserRoleSchema),
  changeUserRole,
);

export default router;
