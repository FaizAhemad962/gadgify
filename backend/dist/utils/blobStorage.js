"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToBlob = exports.isBlobStorageEnabled = void 0;
const path_1 = __importDefault(require("path"));
const blob_1 = require("@vercel/blob");
const isBlobStorageEnabled = () => process.env.VERCEL === "1" && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
exports.isBlobStorageEnabled = isBlobStorageEnabled;
const uploadFileToBlob = async (file, folder) => {
    if (!file.buffer) {
        throw new Error("File buffer is required for Blob uploads");
    }
    const extension = path_1.default.extname(file.originalname);
    const basename = path_1.default
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
    const filename = `${folder}/${basename || "upload"}-${Date.now()}${extension}`;
    const blob = await (0, blob_1.put)(filename, file.buffer, {
        access: "public",
        contentType: file.mimetype,
        addRandomSuffix: true,
    });
    return blob.url;
};
exports.uploadFileToBlob = uploadFileToBlob;
