import { Router } from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  createPaymentIntent,
  confirmPayment,
} from '../controllers/orderController'
import { authenticate } from '../middlewares/auth'
import { validate, validateMaharashtra } from '../middlewares/validate'
import { createOrderSchema } from '../validators'

const router = Router()

router.use(authenticate)

router.post('/', validate(createOrderSchema), validateMaharashtra, createOrder)
router.get('/', getOrders)
router.get('/:id', getOrderById)
router.post('/:orderId/payment-intent', createPaymentIntent)
router.post('/:orderId/confirm-payment', confirmPayment)

export default router
