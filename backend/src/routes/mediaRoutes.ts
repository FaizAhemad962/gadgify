import { Router } from "express";
import { deleteMediaByUrlAndProductId } from "../controllers/mediaController";

import { authenticate, authorize } from "../middlewares/auth";

const router = Router();
console.log("HERE IN MEDIA ROUTES");
router.delete(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteMediaByUrlAndProductId,
);

export default router;
