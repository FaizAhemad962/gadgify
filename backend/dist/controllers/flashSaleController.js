"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFlashSale = exports.updateFlashSale = exports.createFlashSale = exports.getUpcomingFlashSales = exports.getFlashSaleById = exports.getAllFlashSales = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all active flash sales
const getAllFlashSales = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const now = new Date();
        const [flashSales, total] = await Promise.all([
            prisma.flashSale.findMany({
                where: {
                    isActive: true,
                    startTime: { lte: now },
                    endTime: { gte: now },
                },
                orderBy: { endTime: "asc" }, // Ending soonest first
                skip,
                take: Number(limit),
            }),
            prisma.flashSale.count({
                where: {
                    isActive: true,
                    startTime: { lte: now },
                    endTime: { gte: now },
                },
            }),
        ]);
        res.json({
            success: true,
            data: {
                flashSales,
                total,
                page: Number(page),
                limit: Number(limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllFlashSales = getAllFlashSales;
// Get single flash sale by ID
const getFlashSaleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const flashSale = await prisma.flashSale.findUnique({
            where: { id },
        });
        if (!flashSale) {
            res.status(404).json({
                success: false,
                message: "Flash sale not found",
            });
            return;
        }
        res.json({
            success: true,
            data: { flashSale },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFlashSaleById = getFlashSaleById;
// Get upcoming flash sales
const getUpcomingFlashSales = async (req, res, next) => {
    try {
        const now = new Date();
        const flashSales = await prisma.flashSale.findMany({
            where: {
                isActive: true,
                startTime: { gt: now },
            },
            orderBy: { startTime: "asc" },
            take: 5, // Show next 5 upcoming
        });
        res.json({
            success: true,
            data: { flashSales },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUpcomingFlashSales = getUpcomingFlashSales;
// Create flash sale (Admin only)
const createFlashSale = async (req, res, next) => {
    try {
        const { productId, title, description, discountPercentage, maxDiscount, startTime, endTime, } = req.body;
        const flashSale = await prisma.flashSale.create({
            data: {
                productId,
                title,
                description,
                discountPercentage,
                maxDiscount,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
            },
        });
        res.status(201).json({
            success: true,
            message: "Flash sale created successfully",
            data: { flashSale },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createFlashSale = createFlashSale;
// Update flash sale (Admin only)
const updateFlashSale = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, discountPercentage, maxDiscount, startTime, endTime, isActive, } = req.body;
        const flashSale = await prisma.flashSale.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(discountPercentage !== undefined && { discountPercentage }),
                ...(maxDiscount !== undefined && { maxDiscount }),
                ...(startTime && { startTime: new Date(startTime) }),
                ...(endTime && { endTime: new Date(endTime) }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        res.json({
            success: true,
            message: "Flash sale updated successfully",
            data: { flashSale },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateFlashSale = updateFlashSale;
// Delete flash sale (Admin only)
const deleteFlashSale = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.flashSale.delete({ where: { id } });
        res.json({
            success: true,
            message: "Flash sale deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFlashSale = deleteFlashSale;
