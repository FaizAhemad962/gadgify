"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.cancelPendingOrder = exports.retryPayment = exports.confirmPayment = exports.createPaymentIntent = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const database_1 = __importDefault(require("../config/database"));
const razorpay_1 = require("../config/razorpay");
const config_1 = require("../config");
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../utils/email");
const logger_1 = __importDefault(require("../utils/logger"));
// Helper function to parse shippingAddress JSON
const transformOrder = (order) => {
    if (!order)
        return order;
    return {
        ...order,
        shippingAddress: typeof order.shippingAddress === "string"
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress,
    };
};
const createOrder = async (req, res, next) => {
    try {
        console.log("--------- req body", req.body);
        const { items, subtotal, shipping, total, shippingAddress, couponCode } = req.body;
        const userId = req.user.id;
        // Fetch all products
        const productIds = items.map((item) => item.productId);
        const products = await database_1.default.product.findMany({
            where: { id: { in: productIds }, deletedAt: null },
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
        let appliedCouponCode = null;
        if (couponCode) {
            const coupon = await database_1.default.coupon.findUnique({
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
            }
            else {
                discount = coupon.discountValue;
            }
            if (discount > subtotal) {
                discount = subtotal;
            }
            discount = Math.round(discount * 100) / 100;
            appliedCouponCode = coupon.code;
            // Increment usage count
            await database_1.default.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } },
            });
        }
        const finalTotal = subtotal + shipping - discount;
        // Create order
        const order = await database_1.default.order.create({
            data: {
                userId,
                subtotal,
                shipping,
                discount,
                couponCode: appliedCouponCode,
                total: finalTotal,
                shippingAddress: JSON.stringify(shippingAddress),
                items: {
                    create: items.map((item) => ({
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
        const cart = await database_1.default.cart.findUnique({ where: { userId } });
        if (cart) {
            await database_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        // Send order confirmation email (non-blocking)
        if (order.user?.email) {
            (0, email_1.sendOrderConfirmationEmail)(order.user.email, {
                orderId: order.id,
                userName: order.user.name || "Customer",
                items: order.items.map((item) => ({
                    name: item.product?.name || "Product",
                    quantity: item.quantity,
                    price: item.price,
                })),
                subtotal: order.subtotal || 0,
                shipping: order.shipping || 0,
                discount: order.discount || 0,
                total: order.total,
                couponCode: order.couponCode,
            }).catch((err) => logger_1.default.error(`Order confirmation email failed for ${order.id}: ${err.message}`));
        }
        res.status(201).json(transformOrder(order));
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
/**
 * Update product stock - moves to payment confirmation
 * Stock is only decremented when payment is confirmed
 */
const decrementProductStock = async (items) => {
    for (const item of items) {
        await database_1.default.product.update({
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
const checkLowStockAndAlert = async (items) => {
    if (config_1.config.adminEmail) {
        const updatedProducts = await database_1.default.product.findMany({
            where: {
                id: { in: items.map((i) => i.productId) },
                stock: { lte: 5 },
                deletedAt: null,
            },
            select: { id: true, name: true, stock: true },
        });
        if (updatedProducts.length > 0) {
            (0, email_1.sendLowStockAlertEmail)(config_1.config.adminEmail, updatedProducts).catch((err) => logger_1.default.error(`Low stock alert email failed: ${err.message}`));
        }
    }
};
const getOrders = async (req, res, next) => {
    try {
        const orders = await database_1.default.order.findMany({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(orders.map(transformOrder));
    }
    catch (error) {
        next(error);
    }
};
exports.getOrders = getOrders;
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await database_1.default.order.findUnique({
            where: { id },
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
            res.status(404).json({ message: "Order not found" });
            return;
        }
        // Check if user owns the order
        if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        res.json(transformOrder(order));
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
const createPaymentIntent = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await database_1.default.order.findUnique({
            where: { id: orderId },
        });
        if (!order || order.userId !== req.user.id) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        if (order.paymentStatus === "COMPLETED") {
            res.status(400).json({ message: "Order already paid" });
            return;
        }
        // Create Razorpay order
        const razorpayOrder = await razorpay_1.razorpayInstance.orders.create({
            amount: Math.round(order.total * 100), // Amount in paise
            currency: "INR",
            receipt: order.id,
            notes: {
                orderId: order.id,
                userId: req.user.id,
            },
        });
        res.json({
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: config_1.config.razorpayKeyId,
            orderId: order.id,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPaymentIntent = createPaymentIntent;
const confirmPayment = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const order = await database_1.default.order.findUnique({
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
        if (!order || order.userId !== req.user.id) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        // Verify Razorpay signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", config_1.config.razorpayKeySecret)
            .update(body.toString())
            .digest("hex");
        if (expectedSignature !== razorpay_signature) {
            res.status(400).json({ message: "Invalid payment signature" });
            return;
        }
        const updatedOrder = await database_1.default.order.update({
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
            (0, email_1.sendPaymentSuccessEmail)(updatedOrder.user.email, {
                orderId: updatedOrder.id,
                userName: updatedOrder.user.name || "Customer",
                total: updatedOrder.total,
                paymentId: razorpay_payment_id,
            }).catch((err) => logger_1.default.error(`Payment success email failed for ${updatedOrder.id}: ${err.message}`));
        }
        res.json(transformOrder(updatedOrder));
    }
    catch (error) {
        next(error);
    }
};
exports.confirmPayment = confirmPayment;
/**
 * Retry payment for a pending order
 * Allows users to retry payment if their order is still pending
 */
const retryPayment = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await database_1.default.order.findUnique({
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
            res.status(404).json({ success: false, message: "Order not found" });
            return;
        }
        // Only the owner or admin can retry payment
        if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        // Only allow retry on pending orders
        if (order.paymentStatus !== "PENDING") {
            res.status(400).json({
                success: false,
                message: `Cannot retry payment for order with payment status: ${order.paymentStatus}`,
            });
            return;
        }
        // Create new Razorpay order for retry
        const razorpayOrder = await razorpay_1.razorpayInstance.orders.create({
            amount: Math.round(order.total * 100), // Amount in paise
            currency: "INR",
            receipt: `${order.id}-retry-${Date.now()}`,
            notes: {
                orderId: order.id,
                userId: order.userId,
                isRetry: "true",
            },
        });
        res.json({
            success: true,
            message: "Payment retry initiated",
            data: {
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: config_1.config.razorpayKeyId,
                orderId: order.id,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.retryPayment = retryPayment;
/**
 * Cancel pending order
 * Allows users or admins to cancel orders that are pending payment
 * No need to restore stock since it was never decremented
 */
const cancelPendingOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await database_1.default.order.findUnique({
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
        if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
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
        const cancelledOrder = await database_1.default.order.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.cancelPendingOrder = cancelPendingOrder;
// Admin routes
const getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;
        // Build search filter
        const searchFilter = search
            ? {
                OR: [
                    { id: { contains: search, mode: "insensitive" } },
                    {
                        user: {
                            name: { contains: search, mode: "insensitive" },
                        },
                    },
                    {
                        user: {
                            email: { contains: search, mode: "insensitive" },
                        },
                    },
                ],
            }
            : {};
        const [orders, total] = await Promise.all([
            database_1.default.order.findMany({
                where: searchFilter,
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
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            database_1.default.order.count({ where: searchFilter }),
        ]);
        res.json({
            orders: orders.map(transformOrder),
            total,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await database_1.default.order.update({
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
            (0, email_1.sendOrderStatusEmail)(order.user.email, {
                orderId: order.id,
                userName: order.user.name || "Customer",
                status,
            }).catch((err) => logger_1.default.error(`Order status email failed for ${order.id}: ${err.message}`));
        }
        res.json(transformOrder(order));
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
