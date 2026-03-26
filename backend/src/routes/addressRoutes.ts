import { Router } from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createAddressSchema, updateAddressSchema } from "../validators";

const router = Router();

router.get("/", authenticate, getAddresses);
router.post("/", authenticate, validate(createAddressSchema), createAddress);
router.put("/:id", authenticate, validate(updateAddressSchema), updateAddress);
router.delete("/:id", authenticate, deleteAddress);

export default router;
