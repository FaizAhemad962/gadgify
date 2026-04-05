import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import multiAccountService from "../services/multiAccountService";
import auditLogService from "../services/auditLogService";
import { hashPassword } from "../utils/auth";

export const getAccountsByEmail = async (
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

    const accounts = await multiAccountService.getAccountsByEmail(
      req.user.email,
    );

    res.json({
      success: true,
      message: "Accounts fetched",
      data: {
        email: req.user.email,
        totalAccounts: accounts.length,
        accounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAdditionalAccount = async (
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

    const {
      password,
      role,
      name,
      phone,
      city,
      state,
      address,
      pincode,
      accountName,
    } = req.body;

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
    const hashedPassword = await hashPassword(password);

    const newAccount = await multiAccountService.createAccountForEmail(
      req.user.email,
      hashedPassword,
      role,
      name,
      phone,
      city,
      state,
      address,
      pincode,
      accountName,
    );

    res.status(201).json({
      success: true,
      message: "Additional account created successfully",
      data: newAccount,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const hasMultipleAccounts = async (
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

    const hasMultiple = await multiAccountService.hasMultipleAccounts(
      req.user.email,
    );
    const count = await multiAccountService.getAccountCount(req.user.email);

    res.json({
      success: true,
      message: "Account check completed",
      data: {
        email: req.user.email,
        hasMultipleAccounts: hasMultiple,
        totalAccounts: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMultiAccountStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Only admins can view stats
    if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const stats = await multiAccountService.getMultiAccountStats();

    res.json({
      success: true,
      message: "Multi-account statistics",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAccountsGrouped = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Only admins can view all accounts
    if (!req.user || !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const grouped = await multiAccountService.getAllAccountsGroupedByEmail();

    res.json({
      success: true,
      message: "All accounts grouped by email",
      data: grouped,
    });
  } catch (error) {
    next(error);
  }
};
