import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middlewares/auth";

// Validate a coupon code (user-facing)
export const validateCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      res.status(404).json({ success: false, message: "Invalid coupon code" });
      return;
    }

    if (!coupon.isActive) {
      res
        .status(400)
        .json({ success: false, message: "This coupon is no longer active" });
      return;
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      res
        .status(400)
        .json({ success: false, message: "This coupon has expired" });
      return;
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      res
        .status(400)
        .json({
          success: false,
          message: "This coupon has reached its usage limit",
        });
      return;
    }

    if (subtotal < coupon.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`,
      });
      return;
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Discount cannot exceed subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }

    res.json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: Math.round(discount * 100) / 100,
        maxDiscount: coupon.maxDiscount,
        minOrderAmount: coupon.minOrderAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============ Admin CRUD ============

// Get all coupons
export const getAllCoupons = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

// Create coupon
export const createCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      expiresAt,
    } = req.body;

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      res
        .status(409)
        .json({ success: false, message: "Coupon code already exists" });
      return;
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res
      .status(201)
      .json({ success: true, message: "Coupon created", data: coupon });
  } catch (error) {
    next(error);
  }
};

// Update coupon
export const updateCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      isActive,
      expiresAt,
    } = req.body;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && { discountValue }),
        ...(minOrderAmount !== undefined && { minOrderAmount }),
        ...(maxDiscount !== undefined && { maxDiscount }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(isActive !== undefined && { isActive }),
        ...(expiresAt !== undefined && {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
      },
    });

    res.json({ success: true, message: "Coupon updated", data: updated });
  } catch (error) {
    next(error);
  }
};

// Delete coupon
export const deleteCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }

    await prisma.coupon.delete({ where: { id } });

    res.json({ success: true, message: "Coupon deleted", data: null });
  } catch (error) {
    next(error);
  }
};
