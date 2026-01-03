import { Router } from 'express'
import { getAllOrders, updateOrderStatus } from '../controllers/orderController'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/orders', getAllOrders)
router.patch('/orders/:orderId', updateOrderStatus)

export default router
