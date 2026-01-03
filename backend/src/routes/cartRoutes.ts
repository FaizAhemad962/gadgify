import { Router } from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController'
import { authenticate } from '../middlewares/auth'
import { validate } from '../middlewares/validate'
import { addToCartSchema, updateCartItemSchema } from '../validators'

const router = Router()

router.use(authenticate)

router.get('/', getCart)
router.post('/items', validate(addToCartSchema), addToCart)
router.put('/items/:itemId', validate(updateCartItemSchema), updateCartItem)
router.delete('/items/:itemId', removeFromCart)
router.delete('/', clearCart)

export default router
