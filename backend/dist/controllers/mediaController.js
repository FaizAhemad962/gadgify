"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMediaByUrlAndProductId = void 0;
const database_1 = __importDefault(require("../config/database"));
const deleteMediaByUrlAndProductId = async (req, res, next) => {
    try {
        const { url, productId } = req.body;
        // 1️⃣ Validate input
        if (!url || !productId) {
            res.status(400).json({
                message: "url and productId are required",
            });
            return;
        }
        // 2️⃣ Delete
        const result = await database_1.default.productMedia.deleteMany({
            where: {
                url,
                productId,
            },
        });
        // 3️⃣ Nothing deleted → not found
        if (result.count === 0) {
            res.status(404).json({
                message: "Media not found for this product",
            });
            return;
        }
        // 4️⃣ Success
        res.status(200).json({
            message: "Media deleted successfully",
            deletedCount: result.count,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMediaByUrlAndProductId = deleteMediaByUrlAndProductId;
