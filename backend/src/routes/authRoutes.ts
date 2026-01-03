import { Router } from 'express'
import { signup, login, getProfile } from '../controllers/authController'
import { authenticate } from '../middlewares/auth'
import { validate, validateMaharashtra } from '../middlewares/validate'
import { loginSchema, signupSchema } from '../validators'

const router = Router()

router.post('/signup', validate(signupSchema), validateMaharashtra, signup)
router.post('/login', validate(loginSchema), login)
router.get('/profile', authenticate, getProfile)

export default router
