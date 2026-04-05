import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import roleChangeService from "../services/roleChangeService";

export const grantRoleChangePermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, canRemovePermission } = req.body;

    if (!req.user?.id) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const permission = await roleChangeService.grantRoleChangePermission(
      req.user.id,
      email,
      canRemovePermission || false,
    );

    res.json({
      success: true,
      message: "Role change permission granted successfully",
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

export const revokeRoleChangePermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    if (!req.user?.id) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const revoked = await roleChangeService.revokeRoleChangePermission(
      req.user.id,
      userId,
    );

    res.json({
      success: true,
      message: "Role change permission revoked successfully",
      data: revoked,
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!req.user?.id) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const updated = await roleChangeService.changeUserRole(
      req.user.id,
      userId,
      role,
    );

    res.json({
      success: true,
      message: "User role changed successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPermissions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const permissions = await roleChangeService.getAllPermissions(req.user.id);

    res.json({
      success: true,
      message: "Permissions fetched successfully",
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    if (!req.user?.id) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const permission = await roleChangeService.getUserPermission(
      userId,
      req.user.id,
    );

    res.json({
      success: true,
      message: "Permission fetched successfully",
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

export const checkRoleChangePermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const canChange = await roleChangeService.canChangeRoles(req.user.id);

    res.json({
      success: true,
      message: "Permission check completed",
      data: { canChangeRoles: canChange },
    });
  } catch (error) {
    next(error);
  }
};
