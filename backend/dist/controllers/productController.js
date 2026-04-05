"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsAdmin = exports.searchProducts = exports.getProductSuggestions = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllProducts = async (req, res, next) => {
    try {
        // Extract query parameters for filtering and sorting
        const { search = "", minPrice = 0, maxPrice = 100000, minRating = 0, category = "", sortBy = "popularity", page = 1, limit = 12, } = req.query;
        const pageLimit = parseInt(limit);
        const minRatingNum = parseInt(minRating);
        // Build where clause for filtering
        const whereClause = {
            deletedAt: null,
            price: {
                gte: parseInt(minPrice),
                lte: parseInt(maxPrice),
            },
        };
        // Add search filter if provided - use AND with other filters
        if (search) {
            whereClause.AND = [
                {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        {
                            description: { contains: search, mode: "insensitive" },
                        },
                        { category: { contains: search, mode: "insensitive" } },
                    ],
                },
            ];
        }
        // Add category filter if provided (supports comma-separated for multi-select)
        if (category) {
            const categoryStr = category;
            const categoryList = categoryStr.includes(",")
                ? categoryStr
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean)
                : null;
            if (categoryList && categoryList.length > 1) {
                // Multiple categories: use OR with contains for each
                const categoryCondition = {
                    OR: categoryList.map((c) => ({
                        category: { contains: c, mode: "insensitive" },
                    })),
                };
                if (whereClause.AND) {
                    whereClause.AND.push(categoryCondition);
                }
                else {
                    whereClause.AND = [categoryCondition];
                }
            }
            else if (whereClause.AND) {
                whereClause.AND.push({
                    category: { contains: categoryStr, mode: "insensitive" },
                });
            }
            else {
                whereClause.category = {
                    contains: categoryStr,
                    mode: "insensitive",
                };
            }
        }
        // Fetch all matching products (we'll paginate after filtering)
        // If rating filter is applied, fetch extra to account for filtering
        const fetchMultiplier = minRatingNum > 0 ? 3 : 1; // Fetch 3x more if rating filter
        const allProducts = await database_1.default.product.findMany({
            where: whereClause,
            include: {
                ratings: {
                    select: {
                        rating: true,
                    },
                },
                media: true,
            },
        });
        // Calculate average rating for all products and filter by minimum rating
        let productsWithRatings = allProducts.map((product) => {
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
        // Filter by minimum rating
        if (minRatingNum > 0) {
            productsWithRatings = productsWithRatings.filter((p) => p.averageRating >= minRatingNum);
        }
        // Sort products based on sortBy parameter
        productsWithRatings.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "rating":
                    return b.averageRating - a.averageRating;
                case "newest":
                    return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                case "popularity":
                default:
                    // Sort by total ratings as a proxy for popularity
                    return b.totalRatings - a.totalRatings;
            }
        });
        // Apply pagination after filtering
        const pageNum = parseInt(page) || 1;
        const skip = (pageNum - 1) * pageLimit;
        const paginatedProducts = productsWithRatings.slice(skip, skip + pageLimit);
        const total = productsWithRatings.length;
        res.json({
            products: paginatedProducts,
            total,
            page: pageNum,
            limit: pageLimit,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await database_1.default.product.findFirst({
            where: { id, deletedAt: null },
            include: { media: true },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
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
        const { name, description, price, stock, media, colors, category, hsnNo, gstPercentage, } = req.body;
        const product = await database_1.default.product.create({
            data: {
                name,
                description,
                price,
                stock,
                colors,
                category,
                hsnNo,
                gstPercentage,
            },
        });
        // Create media records if provided
        if (media && Array.isArray(media)) {
            await Promise.all(media.map((m) => database_1.default.productMedia.create({
                data: {
                    url: m.url,
                    type: m.type,
                    isPrimary: !!m.isPrimary,
                    productId: product.id,
                },
            })));
        }
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
        const { name, description, price, stock, media, colors, category, hsnNo, gstPercentage, } = req.body;
        const product = await database_1.default.product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                stock,
                colors,
                category,
                hsnNo,
                gstPercentage,
            },
        });
        // Remove old media and add new
        if (media && Array.isArray(media)) {
            await database_1.default.productMedia.deleteMany({ where: { productId: id } });
            await Promise.all(media.map((m) => database_1.default.productMedia.create({
                data: {
                    url: m.url,
                    type: m.type,
                    isPrimary: !!m.isPrimary,
                    productId: id,
                },
            })));
        }
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
            res.status(404).json({ message: "Product not found" });
            return;
        }
        await database_1.default.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        res.status(200).json({ message: "Product archived" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const getProductSuggestions = async (req, res, next) => {
    try {
        const q = (req.query.q || "").trim();
        if (q.length < 2) {
            res.json({ success: true, data: [] });
            return;
        }
        const products = await database_1.default.product.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { category: { contains: q, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                name: true,
                price: true,
                category: true,
                media: {
                    where: { isPrimary: true },
                    select: { url: true },
                    take: 1,
                },
            },
            take: 8,
            orderBy: { name: "asc" },
        });
        const suggestions = products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            image: p.media?.[0]?.url || null,
        }));
        res.json({ success: true, data: suggestions });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductSuggestions = getProductSuggestions;
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
        const search = req.query.search || "";
        const skip = (page - 1) * limit;
        // Build search filter
        const searchFilter = search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { category: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            }
            : {};
        const [products, total] = await Promise.all([
            database_1.default.product.findMany({
                where: { deletedAt: null, ...searchFilter },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    ratings: {
                        select: {
                            rating: true,
                        },
                    },
                    media: true,
                },
            }),
            database_1.default.product.count({
                where: { deletedAt: null, ...searchFilter },
            }),
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
