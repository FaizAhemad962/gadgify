import { Router } from "express";
import {
  getAllOrders,
  updateOrderStatus,
  markCashOnDeliveryCollected,
} from "../controllers/orderController";
import {
  getAllProductsAdmin,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { getDashboardAnalytics } from "../controllers/analyticsController";
import {
  getAllUsers,
  createUser,
  updateUserRole,
  softDeleteUser,
} from "../controllers/userController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { updateUserRoleSchema, createUserSchema, productSchema } from "../validators";

const router = Router();

router.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"));

// Analytics
router.get("/analytics", getDashboardAnalytics);

// Products
router.get("/products", getAllProductsAdmin);
router.put("/products/:id", validate(productSchema), updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId", updateOrderStatus);
router.patch("/orders/:orderId/cash-collected", markCashOnDeliveryCollected);

// Users
router.get("/users", getAllUsers);
router.post("/users", validate(createUserSchema), createUser);
router.patch("/users/:id/role", validate(updateUserRoleSchema), updateUserRole);
router.delete("/users/:id", softDeleteUser);

export default router;
