import { Router } from 'express'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '../controllers/productController'
import {
  getRatings,
  createRating,
  deleteRating,
} from '../controllers/ratingController'
import { authenticate, authorize } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { uploadLimiter } from '../middlewares/rateLimiter'
import { productSchema, ratingSchema } from '../validators'
import { upload, videoUpload } from '../middlewares/upload'
import { Request, Response } from 'express'
import { fetchGSTRateByHSN } from '../services/gstService'

const router = Router()

router.get('/', getAllProducts)
router.get('/search', searchProducts)
router.get('/:id', getProductById)

// Image upload endpoint (Admin only)
router.post(
  '/upload-image',
  authenticate,
  authorize('ADMIN'),
  uploadLimiter,
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }
    const imageUrl = `/uploads/${req.file.filename}`
    res.json({ imageUrl })
  }
)

// Video upload endpoint (Admin only)
router.post(
  '/upload-video',
  authenticate,
  authorize('ADMIN'),
  uploadLimiter,
  videoUpload.single('video'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' })
    }
    const videoUrl = `/uploads/${req.file.filename}`
    res.json({ videoUrl })
  }
)

// Admin only
router.post('/', authenticate, authorize('ADMIN'), validate(productSchema), createProduct)
router.put('/:id', authenticate, authorize('ADMIN'), validate(productSchema), updateProduct)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct)

// Rating routes
router.get('/:productId/ratings', getRatings)
router.post('/:productId/ratings', authenticate, validate(ratingSchema), createRating)
router.delete('/:productId/ratings', authenticate, deleteRating)

// GST rate endpoint - Get GST rate by HSN code from government sources
router.get('/gst/rate/:hsn', async (req: Request, res: Response) => {
  try {
    const { hsn } = req.params
    
    // Validate HSN format (should be 4-8 digits)
    if (!hsn || !/^\d{4,8}$/.test(hsn)) {
      return res.status(400).json({ message: 'Invalid HSN code format' })
    }

    const gstData = await fetchGSTRateByHSN(hsn)
    
    res.json({
      hsn: gstData.hsn,
      gstRate: gstData.gstRate,
      description: gstData.description,
      lastUpdated: gstData.lastUpdated,
      source: 'government-api-with-fallback',
    })
  } catch (error) {
    console.error('Error fetching GST rate:', error)
    res.status(500).json({ message: 'Failed to fetch GST rate' })
  }
})

export default router
