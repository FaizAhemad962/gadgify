import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middlewares/auth";
import { razorpayInstance } from "../config/razorpay";
import { config } from "../config";
import crypto from "crypto";
import {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendOrderStatusEmail,
  sendLowStockAlertEmail,
} from "../utils/email";
import logger from "../utils/logger";

// Helper function to parse shippingAddress JSON
const transformOrder = (order: any) => {
  if (!order) return order;
  return {
    ...order,
    shippingAddress:
      typeof order.shippingAddress === "string"
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress,
  };
};

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // SECURITY: Do not log request body in production (may contain sensitive data)
    if (process.env.NODE_ENV === "development") {
      console.log("--------- req body", req.body);
    }
    const { items, subtotal, shipping, total, shippingAddress, couponCode } =
      req.body;
    const userId = req.user!.id;

    // Fetch all products
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null } as any,
    });

    // Create a map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate stock for all items
    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        res
          .status(404)
          .json({ message: `Product ${item.productId} not found` });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
        return;
      }
    }

    // Validate and apply coupon if provided
    let discount = 0;
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        res.status(400).json({ message: "Invalid or inactive coupon code" });
        return;
      }

      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        res.status(400).json({ message: "This coupon has expired" });
        return;
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        res
          .status(400)
          .json({ message: "This coupon has reached its usage limit" });
        return;
      }

      if (subtotal < coupon.minOrderAmount) {
        res.status(400).json({
          message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
        });
        return;
      }

      if (coupon.discountType === "PERCENTAGE") {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discountValue;
      }

      if (discount > subtotal) {
        discount = subtotal;
      }

      discount = Math.round(discount * 100) / 100;
      appliedCouponCode = coupon.code;

      // Increment usage count
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    const finalTotal = subtotal + shipping - discount;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        subtotal,
        shipping,
        discount,
        couponCode: appliedCouponCode,
        total: finalTotal,
        shippingAddress: JSON.stringify(shippingAddress),
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    });

    // Clear cart
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    // Send order confirmation email (non-blocking)
    if (order.user?.email) {
      sendOrderConfirmationEmail(order.user.email, {
        orderId: order.id,
        userName: order.user.name || "Customer",
        items: order.items.map((item: any) => ({
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: order.subtotal || 0,
        shipping: order.shipping || 0,
        discount: order.discount || 0,
        total: order.total,
        couponCode: order.couponCode,
      }).catch((err: Error) =>
        logger.error(
          `Order confirmation email failed for ${order.id}: ${err.message}`,
        ),
      );
    }

    res.status(201).json(transformOrder(order));
  } catch (error) {
    next(error);
  }
};

/**
 * Update product stock - moves to payment confirmation
 * Stock is only decremented when payment is confirmed
 */
const decrementProductStock = async (items: any[]) => {
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }
};

/**
 * Check for low stock and send alert
 */
const checkLowStockAndAlert = async (items: any[]) => {
  if (config.adminEmail) {
    const updatedProducts = await prisma.product.findMany({
      where: {
        id: { in: items.map((i: any) => i.productId) },
        stock: { lte: 5 },
        deletedAt: null,
      },
      select: { id: true, name: true, stock: true },
    });
    if (updatedProducts.length > 0) {
      sendLowStockAlertEmail(config.adminEmail, updatedProducts).catch(
        (err: Error) =>
          logger.error(`Low stock alert email failed: ${err.message}`),
      );
    }
  }
};

export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: {
              include: { media: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders.map(transformOrder));
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { media: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Check if user owns the order
    if (order.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.json(transformOrder(order));
  } catch (error) {
    next(error);
  }
};

export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== req.user!.id) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (order.paymentStatus === "COMPLETED") {
      res.status(400).json({ message: "Order already paid" });
      return;
    }

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(order.total * 100), // Amount in paise
      currency: "INR",
      receipt: order.id,
      notes: {
        orderId: order.id,
        userId: req.user!.id,
      },
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: config.razorpayKeyId,
      orderId: order.id,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order || order.userId !== req.user!.id) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpayKeySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ message: "Invalid payment signature" });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "COMPLETED",
        paymentId: razorpay_payment_id,
        status: "PROCESSING",
      },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    });

    // Decrement product stock only after payment is confirmed
    await decrementProductStock(updatedOrder.items);

    // Check for low stock and alert admin
    await checkLowStockAndAlert(updatedOrder.items);

    // Send payment success email (non-blocking)
    if (updatedOrder.user?.email) {
      sendPaymentSuccessEmail(updatedOrder.user.email, {
        orderId: updatedOrder.id,
        userName: updatedOrder.user.name || "Customer",
        total: updatedOrder.total,
        paymentId: razorpay_payment_id,
      }).catch((err: Error) =>
        logger.error(
          `Payment success email failed for ${updatedOrder.id}: ${err.message}`,
        ),
      );
    }

    res.json(transformOrder(updatedOrder));
  } catch (error) {
    next(error);
  }
};

/**
 * Retry payment for a pending order
 * Allows users to retry payment if their order is still pending
 */
export const retryPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;

    logger.info(
      `[retryPayment] Processing retry for order: ${orderId}, user: ${req.user!.id}`,
    );

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      logger.warn(`[retryPayment] Order not found: ${orderId}`);
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    logger.info(
      `[retryPayment] Order found: ${order.id}, paymentStatus: ${order.paymentStatus}, userId: ${order.userId}`,
    );

    // Only the owner or admin can retry payment
    if (order.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      logger.warn(
        `[retryPayment] Access denied for user ${req.user!.id} trying to retry order ${orderId}`,
      );
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    // Only allow retry on pending orders
    if (order.paymentStatus !== "PENDING") {
      logger.warn(
        `[retryPayment] Cannot retry non-pending order ${orderId} with status: ${order.paymentStatus}`,
      );
      res.status(400).json({
        success: false,
        message: `Cannot retry payment for order with payment status: ${order.paymentStatus}`,
      });
      return;
    }

    logger.info(
      `[retryPayment] Creating new Razorpay order for ${orderId}, amount: ${order.total}`,
    );

    // Create new Razorpay order for retry
    let razorpayOrder;
    try {
      razorpayOrder = await razorpayInstance.orders.create({
        amount: Math.round(order.total * 100), // Amount in paise
        currency: "INR",
        receipt: `retry-${Date.now()}`.substring(0, 40), // Keep receipt under 40 chars
        notes: {
          orderId: order.id,
          userId: order.userId,
          isRetry: "true",
        },
      });
      logger.info(`[retryPayment] Razorpay order created: ${razorpayOrder.id}`);
    } catch (razorpayError: any) {
      let errorMessage = "Razorpay service error";

      // Extract error message from Razorpay response
      if (razorpayError?.error?.description) {
        errorMessage = razorpayError.error.description;
      } else if (razorpayError?.message) {
        errorMessage = razorpayError.message;
      } else if (razorpayError?.error?.message) {
        errorMessage = razorpayError.error.message;
      }

      logger.error(`[retryPayment] Razorpay API failed:`, {
        message: errorMessage,
        error: razorpayError,
        apiResponse: razorpayError?.error,
      });

      res.status(400).json({
        success: false,
        message: `Failed to create payment order: ${errorMessage}`,
      });
      return;
    }

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: config.razorpayKeyId,
      orderId: order.id,
    });
  } catch (error) {
    logger.error(
      `[retryPayment] Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    if (error instanceof Error) {
      logger.error(`[retryPayment] Stack: ${error.stack}`);
    }
    next(error);
  }
};

/**
 * Cancel pending order
 * Allows users or admins to cancel orders that are pending payment
 * No need to restore stock since it was never decremented
 */
export const cancelPendingOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // Only the owner or admin can cancel
    if (order.userId !== req.user!.id && req.user!.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    // Only allow cancellation of pending orders
    if (order.paymentStatus !== "PENDING") {
      res.status(400).json({
        success: false,
        message: `Cannot cancel order with payment status: ${order.paymentStatus}`,
      });
      return;
    }

    // Mark order as cancelled (stock was never decremented, so no need to restore)
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        paymentStatus: "CANCELLED",
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: transformOrder(cancelledOrder),
    });
  } catch (error) {
    next(error);
  }
};

// Admin routes
export const getAllOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";

    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" as const } },
            {
              user: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            {
              user: {
                email: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: searchFilter,
        include: {
          items: {
            include: {
              product: {
                include: { media: true },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              role: true,
              state: true,
              city: true,
              address: true,
              pincode: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: searchFilter }),
    ]);

    res.json({
      orders: orders.map(transformOrder),
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            state: true,
            city: true,
            address: true,
            pincode: true,
            createdAt: true,
          },
        },
      },
    });

    // Send status update email (non-blocking)
    if (order.user?.email) {
      sendOrderStatusEmail(order.user.email, {
        orderId: order.id,
        userName: order.user.name || "Customer",
        status,
      }).catch((err: Error) =>
        logger.error(
          `Order status email failed for ${order.id}: ${err.message}`,
        ),
      );
    }

    res.json(transformOrder(order));
  } catch (error) {
    next(error);
  }
};
