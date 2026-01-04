"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const validators_1 = require("../validators");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
router.get('/', productController_1.getAllProducts);
router.get('/search', productController_1.searchProducts);
router.get('/:id', productController_1.getProductById);
// Image upload endpoint (Admin only)
router.post('/upload-image', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), upload_1.upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});
// Admin only
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(validators_1.productSchema), productController_1.createProduct);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(validators_1.productSchema), productController_1.updateProduct);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), productController_1.deleteProduct);
exports.default = router;
