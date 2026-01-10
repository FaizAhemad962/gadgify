import { Router } from 'express'
import { getAllOrders, updateOrderStatus } from '../controllers/orderController'
import { getAllProductsAdmin, updateProduct, deleteProduct } from '../controllers/productController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

// Products
router.get('/products', getAllProductsAdmin)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)

// Orders
router.get('/orders', getAllOrders)
router.patch('/orders/:orderId', updateOrderStatus)

export default router
