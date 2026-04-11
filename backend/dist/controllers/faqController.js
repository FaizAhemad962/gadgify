"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementFAQViews = exports.deleteFAQ = exports.updateFAQ = exports.createFAQ = exports.getFAQCategories = exports.getAllFAQs = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all FAQs with optional category filter
const getAllFAQs = async (req, res, next) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { isActive: true };
        if (category) {
            where.category = String(category);
        }
        const [faqs, total] = await Promise.all([
            prisma.fAQ.findMany({
                where,
                orderBy: { order: "asc" },
                skip,
                take: Number(limit),
            }),
            prisma.fAQ.count({ where }),
        ]);
        res.json({
            success: true,
            data: {
                faqs,
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
exports.getAllFAQs = getAllFAQs;
// Get FAQ categories
const getFAQCategories = async (req, res, next) => {
    try {
        const categories = await prisma.fAQ.findMany({
            where: { isActive: true },
            select: { category: true },
            distinct: ["category"],
        });
        res.json({
            success: true,
            data: { categories: categories.map((c) => c.category) },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFAQCategories = getFAQCategories;
// Create FAQ (Admin only)
const createFAQ = async (req, res, next) => {
    try {
        const { question, answer, category, order } = req.body;
        const faq = await prisma.fAQ.create({
            data: {
                question,
                answer,
                category,
                order: order || 0,
            },
        });
        res.status(201).json({
            success: true,
            message: "FAQ created successfully",
            data: { faq },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createFAQ = createFAQ;
// Update FAQ (Admin only)
const updateFAQ = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { question, answer, category, order, isActive } = req.body;
        const faq = await prisma.fAQ.update({
            where: { id },
            data: {
                ...(question && { question }),
                ...(answer && { answer }),
                ...(category && { category }),
                ...(order !== undefined && { order }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        res.json({
            success: true,
            message: "FAQ updated successfully",
            data: { faq },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateFAQ = updateFAQ;
// Delete FAQ (Admin only)
const deleteFAQ = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.fAQ.delete({ where: { id } });
        res.json({
            success: true,
            message: "FAQ deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFAQ = deleteFAQ;
// Increment FAQ views
const incrementFAQViews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const faq = await prisma.fAQ.update({
            where: { id },
            data: { views: { increment: 1 } },
        });
        res.json({
            success: true,
            data: { faq },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.incrementFAQViews = incrementFAQViews;
