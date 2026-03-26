import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middlewares/auth";

// Get all addresses for the current user
export const getAddresses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

// Create a new address
export const createAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { label, name, phone, address, city, state, pincode, isDefault } =
      req.body;

    // If this is the default, unset existing default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if this is the first address — make it default automatically
    const count = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = isDefault || count === 0;

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label: label || "Home",
        name,
        phone,
        address,
        city,
        state: state || "Maharashtra",
        pincode,
        isDefault: shouldBeDefault,
      },
    });

    res.status(201).json({ success: true, data: newAddress });
  } catch (error) {
    next(error);
  }
};

// Update an address
export const updateAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { label, name, phone, address, city, state, pincode, isDefault } =
      req.body;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ message: "Address not found" });
      return;
    }

    // If setting as default, unset other defaults
    if (isDefault && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Delete an address
export const deleteAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ message: "Address not found" });
      return;
    }

    await prisma.address.delete({ where: { id } });

    // If we deleted the default, promote the next one
    if (existing.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (next) {
        await prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    next(error);
  }
};
