import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

// Get all FAQs with optional category filter
export const getAllFAQs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };
    if (category) {
      where.category = String(category);
    }

    const [faqs, total] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        orderBy: { order: "asc" },
        skip,
        take: Number(limit),
      }),
      prisma.fAQ.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        faqs,
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get FAQ categories
export const getFAQCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await prisma.fAQ.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    });

    res.json({
      success: true,
      data: { categories: categories.map((c) => c.category) },
    });
  } catch (error) {
    next(error);
  }
};

// Create FAQ (Admin only)
export const createFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { question, answer, category, order } = req.body;

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category,
        order: order || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: { faq },
    });
  } catch (error) {
    next(error);
  }
};

// Update FAQ (Admin only)
export const updateFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { question, answer, category, order, isActive } = req.body;

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(category && { category }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      message: "FAQ updated successfully",
      data: { faq },
    });
  } catch (error) {
    next(error);
  }
};

// Delete FAQ (Admin only)
export const deleteFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await prisma.fAQ.delete({ where: { id } });

    res.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Increment FAQ views
export const incrementFAQViews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const faq = await prisma.fAQ.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json({
      success: true,
      data: { faq },
    });
  } catch (error) {
    next(error);
  }
};
