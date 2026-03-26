import { Router } from "express";
import {
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import {
  getAllProductsAdmin,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { getDashboardAnalytics } from "../controllers/analyticsController";
import {
  getAllUsers,
  updateUserRole,
  softDeleteUser,
} from "../controllers/userController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { updateUserRoleSchema } from "../validators";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

// Analytics
router.get("/analytics", getDashboardAnalytics);

// Products
router.get("/products", getAllProductsAdmin);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId", updateOrderStatus);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/role", validate(updateUserRoleSchema), updateUserRole);
router.delete("/users/:id", softDeleteUser);

export default router;
