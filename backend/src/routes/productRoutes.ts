import { Router } from 'express'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '../controllers/productController'
import { authenticate, authorize } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { productSchema } from '../validators'
import { upload } from '../middlewares/upload'
import { Request, Response } from 'express'

const router = Router()

router.get('/', getAllProducts)
router.get('/search', searchProducts)
router.get('/:id', getProductById)

// Image upload endpoint (Admin only)
router.post(
  '/upload-image',
  authenticate,
  authorize('ADMIN'),
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }
    const imageUrl = `/uploads/${req.file.filename}`
    res.json({ imageUrl })
  }
)

// Admin only
router.post('/', authenticate, authorize('ADMIN'), validate(productSchema), createProduct)
router.put('/:id', authenticate, authorize('ADMIN'), validate(productSchema), updateProduct)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct)

export default router
