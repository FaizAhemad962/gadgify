"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.confirmPayment = exports.createPaymentIntent = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const database_1 = __importDefault(require("../config/database"));
const razorpay_1 = require("../config/razorpay");
const config_1 = require("../config");
const crypto_1 = __importDefault(require("crypto"));
// Helper function to parse shippingAddress JSON
const transformOrder = (order) => {
    if (!order)
        return order;
    return {
        ...order,
        shippingAddress: typeof order.shippingAddress === 'string'
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress
    };
};
const createOrder = async (req, res, next) => {
    try {
        console.log('--------- req body', req.body);
        const { items, subtotal, shipping, total, shippingAddress } = req.body;
        const userId = req.user.id;
        // Fetch all products
        const productIds = items.map((item) => item.productId);
        const products = await database_1.default.product.findMany({
            where: { id: { in: productIds }, deletedAt: null },
        });
        // Create a map for quick lookup
        const productMap = new Map(products.map(p => [p.id, p]));
        // Validate stock for all items
        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product) {
                res.status(404).json({ message: `Product ${item.productId} not found` });
                return;
            }
            if (product.stock < item.quantity) {
                res.status(400).json({
                    message: `Insufficient stock for ${product.name}`,
                });
                return;
            }
        }
        // Create order
        const order = await database_1.default.order.create({
            data: {
                userId,
                subtotal,
                shipping,
                total: subtotal + shipping,
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
        // Update product stock
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
        // Clear cart
        const cart = await database_1.default.cart.findUnique({ where: { userId } });
        if (cart) {
            await database_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        res.status(201).json(transformOrder(order));
    }
    catch (error) {
        next(error);
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res, next) => {
    try {
        const orders = await database_1.default.order.findMany({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: 'desc' },
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
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        // Check if user owns the order
        if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
            res.status(403).json({ message: 'Access denied' });
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
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (order.paymentStatus === 'COMPLETED') {
            res.status(400).json({ message: 'Order already paid' });
            return;
        }
        // Create Razorpay order
        const razorpayOrder = await razorpay_1.razorpayInstance.orders.create({
            amount: Math.round(order.total * 100), // Amount in paise
            currency: 'INR',
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
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        // Verify Razorpay signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', config_1.config.razorpayKeySecret)
            .update(body.toString())
            .digest('hex');
        if (expectedSignature !== razorpay_signature) {
            res.status(400).json({ message: 'Invalid payment signature' });
            return;
        }
        const updatedOrder = await database_1.default.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'COMPLETED',
                paymentId: razorpay_payment_id,
                status: 'PROCESSING',
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
        res.json(transformOrder(updatedOrder));
    }
    catch (error) {
        next(error);
    }
};
exports.confirmPayment = confirmPayment;
// Admin routes
const getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        // Build search filter
        const searchFilter = search
            ? {
                OR: [
                    { id: { contains: search, mode: 'insensitive' } },
                    { user: { name: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
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
                orderBy: { createdAt: 'desc' },
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
        res.json(transformOrder(order));
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
