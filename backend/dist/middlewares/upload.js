"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoUpload = exports.upload = exports.validateMagicBytesMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fileValidation_1 = require("../utils/fileValidation");
// Ensure uploads directory exists
// Use Render's persistent disk in production, local path in development
const uploadsDir = process.env.NODE_ENV === "production"
    ? "/var/data/uploads"
    : path_1.default.join(__dirname, "../../uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const prefix = file.fieldname === "image" ? "profile-" : "product-";
        cb(null, prefix + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error("Only image files are allowed!"));
    }
};
// File filter for videos
const videoFileFilter = (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = /video/.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error("Only video files are allowed!"));
    }
};
// ✅ SECURITY: Middleware to validate magic bytes after file is uploaded
const validateMagicBytesMiddleware = (allowedExtensions) => {
    return (req, res, next) => {
        if (!req.file) {
            return next();
        }
        try {
            const fileBuffer = fs_1.default.readFileSync(req.file.path);
            const fileName = req.file.originalname;
            const mimeType = req.file.mimetype;
            const validation = (0, fileValidation_1.validateMagicBytes)(fileBuffer, mimeType, fileName);
            if (!validation.valid) {
                // Delete the uploaded file
                fs_1.default.unlinkSync(req.file.path);
                const detectedType = (0, fileValidation_1.getFileTypeFromMagicBytes)(fileBuffer);
                const errorMsg = validation.error || "File content does not match declared format";
                console.warn(`[SECURITY] Malicious file detected: ${errorMsg}`);
                return res.status(400).json({
                    success: false,
                    message: `Security check failed: ${errorMsg}${detectedType ? ` (Detected as ${detectedType})` : ""}`,
                });
            }
            next();
        }
        catch (error) {
            // Delete the uploaded file on error
            if (req.file && req.file.path) {
                try {
                    fs_1.default.unlinkSync(req.file.path);
                }
                catch (unlinkError) {
                    console.error("Failed to delete file after validation error:", unlinkError);
                }
            }
            const errorMsg = error instanceof Error ? error.message : "File validation failed";
            res.status(400).json({
                success: false,
                message: `File validation error: ${errorMsg}`,
            });
        }
    };
};
exports.validateMagicBytesMiddleware = validateMagicBytesMiddleware;
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for images (profile + product)
    },
    fileFilter: imageFileFilter,
});
exports.videoUpload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for videos
    },
    fileFilter: videoFileFilter,
});
