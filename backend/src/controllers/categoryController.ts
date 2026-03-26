import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middlewares/auth";

// Public: get all active categories
export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Admin: get all categories (including inactive)
export const getAllCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Admin: create category
export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, description, icon, sortOrder } = req.body;

    const existing = await prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      res
        .status(400)
        .json({ message: "Category with this name already exists" });
      return;
    }

    const category = await prisma.category.create({
      data: { name, description, icon, sortOrder: sortOrder ?? 0 },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// Admin: update category
export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, icon, sortOrder, isActive } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    // If name is being changed, check for duplicates
    if (name && name !== existing.name) {
      const duplicate = await prisma.category.findUnique({ where: { name } });
      if (duplicate) {
        res
          .status(400)
          .json({ message: "Category with this name already exists" });
        return;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// Admin: delete category
export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    await prisma.category.delete({ where: { id } });

    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};
