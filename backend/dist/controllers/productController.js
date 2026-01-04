"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllProducts = async (req, res, next) => {
    try {
        const products = await database_1.default.product.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(products);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await database_1.default.product.findUnique({ where: { id } });
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
        const { name, description, price, stock, imageUrl, category } = req.body;
        const product = await database_1.default.product.create({
            data: { name, description, price, stock, imageUrl, category },
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
        const { name, description, price, stock, imageUrl, category } = req.body;
        const product = await database_1.default.product.update({
            where: { id },
            data: { name, description, price, stock, imageUrl, category },
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
        await database_1.default.product.delete({ where: { id } });
        res.status(204).send();
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
