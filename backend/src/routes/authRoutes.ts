import { Router } from 'express'
import { signup, login, getProfile, updateProfile, changePassword, updateProfilePhoto } from '../controllers/authController'
import { authenticate } from '../middlewares/auth'
import { validate, validateMaharashtra } from '../middlewares/validate'
import { authLimiter } from '../middlewares/rateLimiter'
import { loginSchema, signupSchema, updateProfileSchema, changePasswordSchema } from '../validators'
import { upload } from '../middlewares/upload'

const router = Router()

router.post('/signup', authLimiter, validate(signupSchema), validateMaharashtra, signup)
router.post('/login', authLimiter, validate(loginSchema), login)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile)
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword)
router.post('/profile-photo', authenticate, upload.single('image'), updateProfilePhoto)

export default router
