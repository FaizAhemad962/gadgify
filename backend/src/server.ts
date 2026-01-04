import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config'
import { errorHandler } from './middlewares/errorHandler'
import { sanitizeInput, sanitizeStrings } from './middlewares/sanitize'
import { logSecurityEvents } from './middlewares/securityLogger'
import { apiLimiter } from './middlewares/rateLimiter'
import logger from './utils/logger'
import authRoutes from './routes/authRoutes'
import productRoutes from './routes/productRoutes'
import cartRoutes from './routes/cartRoutes'
import orderRoutes from './routes/orderRoutes'
import adminRoutes from './routes/adminRoutes'

const app: Application = express()

// Trust proxy (for rate limiting and logging)
app.set('trust proxy', 1)

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'checkout.razorpay.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'http://localhost:5000', 'http://localhost:3000', 'https:'],
        connectSrc: ["'self'", 'https://api.razorpay.com'],
        frameSrc: ["'self'", 'https://api.razorpay.com'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
  })
)

// CORS
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
)

// Body parser with size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Sanitize input
app.use(sanitizeInput)
app.use(sanitizeStrings)

// Security logging
app.use(logSecurityEvents)

// Rate limiting
app.use('/api/', apiLimiter)

// Serve uploaded files with proper path resolution
const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '7d',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable')
    }
    if (filePath.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable')
    }
  }
}))

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use(errorHandler)

const PORT = config.port

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`📝 Environment: ${config.nodeEnv}`)
  logger.info(`🌐 Frontend URL: ${config.frontendUrl}`)
  logger.info(`🔒 Security: Enabled`)
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Environment: ${config.nodeEnv}`)
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`)
})

export default app
