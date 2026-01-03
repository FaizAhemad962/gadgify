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

const router = Router()

router.get('/', getAllProducts)
router.get('/search', searchProducts)
router.get('/:id', getProductById)

// Admin only
router.post('/', authenticate, authorize('ADMIN'), validate(productSchema), createProduct)
router.put('/:id', authenticate, authorize('ADMIN'), validate(productSchema), updateProduct)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct)

export default router
