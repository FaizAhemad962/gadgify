"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const ratingController_1 = require("../controllers/ratingController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const validators_1 = require("../validators");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
router.get('/', productController_1.getAllProducts);
router.get('/search', productController_1.searchProducts);
router.get('/:id', productController_1.getProductById);
// Image upload endpoint (Admin only)
router.post('/upload-image', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), rateLimiter_1.uploadLimiter, upload_1.upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});
// Video upload endpoint (Admin only)
router.post('/upload-video', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), rateLimiter_1.uploadLimiter, upload_1.videoUpload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No video file uploaded' });
    }
    const videoUrl = `/uploads/${req.file.filename}`;
    res.json({ videoUrl });
});
// Admin only
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(validators_1.productSchema), productController_1.createProduct);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(validators_1.productSchema), productController_1.updateProduct);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), productController_1.deleteProduct);
// Rating routes
router.get('/:productId/ratings', ratingController_1.getRatings);
router.post('/:productId/ratings', auth_1.authenticate, (0, validate_1.validate)(validators_1.ratingSchema), ratingController_1.createRating);
router.delete('/:productId/ratings', auth_1.authenticate, ratingController_1.deleteRating);
exports.default = router;
