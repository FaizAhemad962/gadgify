"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = exports.getCategories = void 0;
const database_1 = __importDefault(require("../config/database"));
// Public: get all active categories
const getCategories = async (req, res, next) => {
    try {
        const categories = await database_1.default.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
        });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
// Admin: get all categories (including inactive)
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await database_1.default.category.findMany({
            orderBy: { sortOrder: "asc" },
        });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCategories = getAllCategories;
// Admin: create category
const createCategory = async (req, res, next) => {
    try {
        const { name, description, icon, sortOrder } = req.body;
        const existing = await database_1.default.category.findUnique({
            where: { name },
        });
        if (existing) {
            res
                .status(400)
                .json({ message: "Category with this name already exists" });
            return;
        }
        const category = await database_1.default.category.create({
            data: { name, description, icon, sortOrder: sortOrder ?? 0 },
        });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
// Admin: update category
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, icon, sortOrder, isActive } = req.body;
        const existing = await database_1.default.category.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        // If name is being changed, check for duplicates
        if (name && name !== existing.name) {
            const duplicate = await database_1.default.category.findUnique({ where: { name } });
            if (duplicate) {
                res
                    .status(400)
                    .json({ message: "Category with this name already exists" });
                return;
            }
        }
        const category = await database_1.default.category.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(icon !== undefined && { icon }),
                ...(sortOrder !== undefined && { sortOrder }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        res.json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
// Admin: delete category
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existing = await database_1.default.category.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        await database_1.default.category.delete({ where: { id } });
        res.json({ success: true, message: "Category deleted" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
