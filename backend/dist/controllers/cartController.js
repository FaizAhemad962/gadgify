"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const database_1 = __importDefault(require("../config/database"));
const getCart = async (req, res, next) => {
    try {
        let cart = await database_1.default.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await database_1.default.cart.create({
                data: { userId: req.user.id },
                include: {
                    items: {
                        include: { product: true },
                    },
                },
            });
        }
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;
        // Check if product exists and has stock
        const product = await database_1.default.product.findFirst({ where: { id: productId, deletedAt: null } });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        if (product.stock < quantity) {
            res.status(400).json({ message: 'Insufficient stock' });
            return;
        }
        // Get or create cart
        let cart = await database_1.default.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await database_1.default.cart.create({ data: { userId } });
        }
        // Check if item already in cart
        const existingItem = await database_1.default.cartItem.findFirst({
            where: { cartId: cart.id, productId },
        });
        if (existingItem) {
            // Update quantity
            await database_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        }
        else {
            // Add new item
            await database_1.default.cartItem.create({
                data: { cartId: cart.id, productId, quantity },
            });
        }
        // Return updated cart
        const updatedCart = await database_1.default.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        res.json(updatedCart);
    }
    catch (error) {
        next(error);
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const cartItem = await database_1.default.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true, product: true },
        });
        if (!cartItem || cartItem.cart.userId !== req.user.id) {
            res.status(404).json({ message: 'Cart item not found' });
            return;
        }
        if (cartItem.product.stock < quantity) {
            res.status(400).json({ message: 'Insufficient stock' });
            return;
        }
        await database_1.default.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });
        const cart = await database_1.default.cart.findUnique({
            where: { id: cartItem.cartId },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCartItem = updateCartItem;
const removeFromCart = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const cartItem = await database_1.default.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true },
        });
        if (!cartItem || cartItem.cart.userId !== req.user.id) {
            res.status(404).json({ message: 'Cart item not found' });
            return;
        }
        await database_1.default.cartItem.delete({ where: { id: itemId } });
        const cart = await database_1.default.cart.findUnique({
            where: { id: cartItem.cartId },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        res.json(cart);
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromCart = removeFromCart;
const clearCart = async (req, res, next) => {
    try {
        const cart = await database_1.default.cart.findUnique({
            where: { userId: req.user.id },
        });
        if (cart) {
            await database_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.clearCart = clearCart;
