"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const productController_1 = require("../controllers/productController");
const analyticsController_1 = require("../controllers/analyticsController");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const validators_1 = require("../validators");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)("ADMIN"));
// Analytics
router.get("/analytics", analyticsController_1.getDashboardAnalytics);
// Products
router.get("/products", productController_1.getAllProductsAdmin);
router.put("/products/:id", productController_1.updateProduct);
router.delete("/products/:id", productController_1.deleteProduct);
// Orders
router.get("/orders", orderController_1.getAllOrders);
router.patch("/orders/:orderId", orderController_1.updateOrderStatus);
// Users
router.get("/users", userController_1.getAllUsers);
router.patch("/users/:id/role", (0, validate_1.validate)(validators_1.updateUserRoleSchema), userController_1.updateUserRole);
router.delete("/users/:id", userController_1.softDeleteUser);
exports.default = router;
