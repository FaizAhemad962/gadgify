"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('ADMIN'));
// Products
router.get('/products', productController_1.getAllProductsAdmin);
router.put('/products/:id', productController_1.updateProduct);
router.delete('/products/:id', productController_1.deleteProduct);
// Orders
router.get('/orders', orderController_1.getAllOrders);
router.patch('/orders/:orderId', orderController_1.updateOrderStatus);
exports.default = router;
