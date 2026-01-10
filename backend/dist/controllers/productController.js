"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsAdmin = exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllProducts = async (req, res, next) => {
    try {
        const products = await database_1.default.product.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: {
                ratings: {
                    select: {
                        rating: true,
                    },
                },
            },
        });
        // Calculate average rating for each product
        const productsWithRatings = products.map((product) => {
            const ratings = product.ratings;
            const averageRating = ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                : 0;
            const totalRatings = ratings.length;
            const { ratings: _, ...productData } = product;
            return {
                ...productData,
                averageRating: Number(averageRating.toFixed(1)),
                totalRatings,
            };
        });
        res.json(productsWithRatings);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await database_1.default.product.findFirst({ where: { id, deletedAt: null } });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, stock, imageUrl, videoUrl, colors, category, hsnNo, gstPercentage } = req.body;
        const product = await database_1.default.product.create({
            data: { name, description, price, stock, imageUrl, videoUrl, colors, category, hsnNo, gstPercentage },
        });
        res.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, imageUrl, videoUrl, colors, category, hsnNo, gstPercentage } = req.body;
        const product = await database_1.default.product.update({
            where: { id },
            data: { name, description, price, stock, imageUrl, videoUrl, colors, category, hsnNo, gstPercentage },
        });
        res.json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = await database_1.default.product.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        await database_1.default.product.update({ where: { id }, data: { deletedAt: new Date() } });
        res.status(200).json({ message: 'Product archived' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query;
        const products = await database_1.default.product.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { name: { contains: q } },
                    { description: { contains: q } },
                    { category: { contains: q } },
                ],
            },
        });
        res.json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.searchProducts = searchProducts;
const getAllProductsAdmin = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        // Build search filter
        const searchFilter = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { category: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [products, total] = await Promise.all([
            database_1.default.product.findMany({
                where: { deletedAt: null, ...searchFilter },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    ratings: {
                        select: {
                            rating: true,
                        },
                    },
                },
            }),
            database_1.default.product.count({ where: { deletedAt: null, ...searchFilter } }),
        ]);
        // Calculate average rating for each product
        const productsWithRatings = products.map((product) => {
            const ratings = product.ratings;
            const averageRating = ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                : 0;
            const totalRatings = ratings.length;
            const { ratings: _, ...productData } = product;
            return {
                ...productData,
                averageRating: Number(averageRating.toFixed(1)),
                totalRatings,
            };
        });
        res.json({
            products: productsWithRatings,
            total,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProductsAdmin = getAllProductsAdmin;
