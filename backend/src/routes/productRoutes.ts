import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductSuggestions,
} from "../controllers/productController";
import {
  getRatings,
  createRating,
  deleteRating,
} from "../controllers/ratingController";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { uploadLimiter } from "../middlewares/rateLimiter";
import { productSchema, ratingSchema } from "../validators";
import {
  upload,
  videoUpload,
  validateMagicBytesMiddleware,
} from "../middlewares/upload";
import { isBlobStorageEnabled, uploadFileToBlob } from "../utils/blobStorage";
import { Request, Response } from "express";

const router = Router();

router.get("/", getAllProducts);
router.get("/suggestions", getProductSuggestions);
router.get("/search", searchProducts);
router.get("/:id", getProductById);

// Image upload endpoint (Admin only)
router.post(
  "/upload-image",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  uploadLimiter,
  upload.single("image"),
  validateMagicBytesMiddleware(["jpg", "jpeg", "png", "gif", "webp"]),
  async (req: Request, res: Response, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const imageUrl = isBlobStorageEnabled()
        ? await uploadFileToBlob(req.file, "products")
        : `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      next(error);
    }
  },
);

// Video upload endpoint (Admin only)
router.post(
  "/upload-video",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  uploadLimiter,
  (req: Request, res: Response, next) => {
    videoUpload.single("video")(req, res, function (err) {
      if (err instanceof Error) {
        // Multer error (file too large, invalid type, etc.)
        return res.status(400).json({ success: false, message: err.message });
      }
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No video file uploaded" });
      }

      // ✅ SECURITY: Validate magic bytes before saving
      validateMagicBytesMiddleware(["mp4", "webm"])(req, res, async () => {
        if (!res.headersSent) {
          try {
            const videoUrl =
              isBlobStorageEnabled() && req.file
                ? await uploadFileToBlob(req.file, "videos")
                : `/uploads/${req.file?.filename}`;
            res.json({ success: true, videoUrl });
          } catch (error) {
            next(error);
          }
        }
      });
    });
  },
);

// Admin only
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(productSchema),
  createProduct,
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  validate(productSchema),
  updateProduct,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  deleteProduct,
);

// Rating routes
router.get("/:productId/ratings", getRatings);
router.post(
  "/:productId/ratings",
  authenticate,
  validate(ratingSchema),
  createRating,
);
router.delete("/:productId/ratings", authenticate, deleteRating);

export default router;
