import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { sendNewsletterWelcomeEmail } from "../utils/email";
import logger from "../utils/logger";

const prisma = new PrismaClient();

/**
 * Subscribe to newsletter
 * POST /api/newsletters/subscribe
 */
export const subscribeToNewsletter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    // console.log("____________________****************__________", email);
    // Check if email already exists
    const existingSubscriber = await prisma.newsletter.findUnique({
      where: { email },
    });
    console.log(
      "____________________****************__________",
      existingSubscriber,
    );

    if (existingSubscriber) {
      // Reactivate if previously unsubscribed
      if (!existingSubscriber.isActive) {
        const updated = await prisma.newsletter.update({
          where: { email },
          data: { isActive: true },
        });

        // Send welcome email
        try {
          await sendNewsletterWelcomeEmail(email);
          logger.info(`Newsletter welcome email sent to ${email}`);
        } catch (emailErr) {
          logger.error("Failed to send newsletter welcome email:", emailErr);
        }

        return res.json({
          success: true,
          message: "Successfully subscribed to newsletter",
          data: updated,
        });
      }
      // Already active
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed to our newsletter",
      });
    }

    // Create new subscriber
    const newsletter = await prisma.newsletter.create({
      data: { email },
    });

    // Send welcome email
    try {
      await sendNewsletterWelcomeEmail(email);
      logger.info(`Newsletter welcome email sent to ${email}`);
    } catch (emailErr) {
      logger.error("Failed to send newsletter welcome email:", emailErr);
    }

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter",
      data: newsletter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unsubscribe from newsletter
 * POST /api/newsletters/unsubscribe
 */
export const unsubscribeFromNewsletter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    const newsletter = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Email not found in newsletter list",
      });
    }

    const updated = await prisma.newsletter.update({
      where: { email },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all newsletter subscribers (Admin only)
 * GET /api/newsletters
 */
export const getAllNewsletterSubscribers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page = 1, limit = 10, isActive = true } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (isActive !== "all") {
      where.isActive = isActive === "true";
    }

    const [subscribers, total] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.newsletter.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        subscribers,
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get newsletter stats (Admin only)
 * GET /api/newsletters/stats
 */
export const getNewsletterStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [totalSubscribers, activeSubscribers] = await Promise.all([
      prisma.newsletter.count(),
      prisma.newsletter.count({ where: { isActive: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalSubscribers,
        activeSubscribers,
        inactiveSubscribers: totalSubscribers - activeSubscribers,
      },
    });
  } catch (error) {
    next(error);
  }
};
