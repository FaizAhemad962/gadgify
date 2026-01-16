"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// Get wishlist for current user
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await database_1.default.wishlist.findMany({
            where: {
                userId,
                deletedAt: null,
            },
            include: {
                product: {
                    include: {
                        media: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(wishlist);
    }
    catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Failed to fetch wishlist' });
    }
});
// Add product to wishlist
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        // Check if product exists
        const product = await database_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Check if already in wishlist
        const existingWishlist = await database_1.default.wishlist.findUnique({
            where: {
                userId_productId: { userId, productId },
            },
        });
        if (existingWishlist) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }
        // Add to wishlist
        const wishlistItem = await database_1.default.wishlist.create({
            data: {
                userId,
                productId,
            },
        });
        res.status(201).json(wishlistItem);
    }
    catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Failed to add to wishlist' });
    }
});
// Remove product from wishlist
router.delete('/:productId', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const wishlistItem = await database_1.default.wishlist.findUnique({
            where: {
                userId_productId: { userId, productId },
            },
        });
        if (!wishlistItem) {
            return res.status(404).json({ message: 'Item not in wishlist' });
        }
        await database_1.default.wishlist.delete({
            where: {
                userId_productId: { userId, productId },
            },
        });
        res.json({ message: 'Removed from wishlist' });
    }
    catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Failed to remove from wishlist' });
    }
});
exports.default = router;
