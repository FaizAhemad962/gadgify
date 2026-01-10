"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRating = exports.createRating = exports.getRatings = void 0;
const database_1 = __importDefault(require("../config/database"));
const getRatings = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const ratings = await database_1.default.rating.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;
        res.json({
            ratings,
            averageRating: Math.round(avgRating * 10) / 10,
            totalRatings: ratings.length,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRatings = getRatings;
const createRating = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Check if product exists
        const product = await database_1.default.product.findFirst({
            where: { id: productId, deletedAt: null },
        });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // Create or update rating
        const userRating = await database_1.default.rating.upsert({
            where: {
                productId_userId: {
                    productId,
                    userId,
                },
            },
            update: {
                rating,
                comment,
            },
            create: {
                productId,
                userId,
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        res.status(201).json(userRating);
    }
    catch (error) {
        next(error);
    }
};
exports.createRating = createRating;
const deleteRating = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        await database_1.default.rating.delete({
            where: {
                productId_userId: {
                    productId,
                    userId,
                },
            },
        });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRating = deleteRating;
