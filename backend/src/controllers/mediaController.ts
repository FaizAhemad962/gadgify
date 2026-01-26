import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

export const deleteMediaByUrlAndProductId = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { url, productId } = req.body;

    // 1️⃣ Validate input
    if (!url || !productId) {
      res.status(400).json({
        message: "url and productId are required",
      });
      return;
    }

    // 2️⃣ Delete
    const result = await prisma.productMedia.deleteMany({
      where: {
        url,
        productId,
      },
    });

    // 3️⃣ Nothing deleted → not found
    if (result.count === 0) {
      res.status(404).json({
        message: "Media not found for this product",
      });
      return;
    }

    // 4️⃣ Success
    res.status(200).json({
      message: "Media deleted successfully",
      deletedCount: result.count,
    });
  } catch (error) {
    next(error);
  }
};
