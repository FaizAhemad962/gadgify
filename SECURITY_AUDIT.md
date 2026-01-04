# 🔒 Security Audit & Implementation Guide

## ✅ Current Security Status

### **Already Implemented (Good!):**
1. ✅ **Helmet** - Security headers
2. ✅ **CORS** - Cross-origin protection
3. ✅ **bcrypt** - Password hashing (10 rounds)
4. ✅ **JWT** - Token-based authentication
5. ✅ **Rate Limiting** - 100 requests per 15 minutes
6. ✅ **Input Validation** - Joi validation
7. ✅ **Prisma ORM** - SQL injection prevention
8. ✅ **Role-based Access** - USER/ADMIN separation
9. ✅ **Environment Variables** - Secrets in .env
10. ✅ **Maharashtra Restriction** - Location validation

---

## ⚠️ Security Issues Found & Fixes Needed

### **🔴 CRITICAL Issues:**

#### 1. **JWT Secret Too Weak**
**Current:** 
```env
JWT_SECRET="gadgify-super-secret-jwt-key-change-this-in-production-2026-minimum-32-chars"
```

**Risk:** Predictable secret, easy to guess  
**Impact:** Attackers can forge authentication tokens  

**Fix:** Generate cryptographically secure random secret

---

#### 2. **No Request Size Limit**
**Risk:** Large payload attacks (DoS)  
**Impact:** Server crash, memory exhaustion  

**Fix:** Add body size limits

---

#### 3. **Missing Security Headers**
**Risk:** XSS, clickjacking, MIME sniffing  
**Impact:** Various attack vectors  

**Fix:** Enhance Helmet configuration

---

#### 4. **No Input Sanitization**
**Risk:** XSS attacks via user input  
**Impact:** Script injection in product names, addresses  

**Fix:** Add express-mongo-sanitize or manual sanitization

---

#### 5. **Weak Rate Limiting**
**Current:** 100 requests/15min (too permissive)  
**Risk:** Brute force attacks on login  
**Impact:** Account takeover  

**Fix:** Stricter limits on sensitive endpoints

---

#### 6. **No Logging/Monitoring**
**Risk:** Can't detect or investigate attacks  
**Impact:** Unknown breaches  

**Fix:** Add Winston logger with security events

---

#### 7. **Razorpay Keys in Plain Text**
**Risk:** Keys visible in .env file  
**Impact:** Payment fraud if exposed  

**Fix:** Use environment-specific keys, add to .gitignore

---

#### 8. **No HTTPS Enforcement**
**Risk:** Man-in-the-middle attacks  
**Impact:** Token/data interception  

**Fix:** Force HTTPS in production

---

#### 9. **JWT No Expiration Check**
**Risk:** Tokens valid forever  
**Impact:** Stolen tokens always work  

**Fix:** Add token refresh mechanism

---

#### 10. **File Upload Vulnerabilities**
**Current:** Basic file type check only  
**Risk:** Malicious file uploads  
**Impact:** Server compromise  

**Fix:** Strict validation, antivirus scanning

---

### **🟡 MEDIUM Issues:**

#### 11. **No Account Lockout**
**Risk:** Unlimited login attempts  
**Impact:** Brute force attacks  

**Fix:** Lock after 5 failed attempts

---

#### 12. **Password Strength Not Enforced**
**Risk:** Weak passwords accepted  
**Impact:** Easy to crack  

**Fix:** Minimum 8 chars, complexity rules

---

#### 13. **No Email Verification**
**Risk:** Fake accounts  
**Impact:** Spam, abuse  

**Fix:** Email verification flow

---

#### 14. **Session Management Issues**
**Risk:** No logout tracking  
**Impact:** Can't revoke tokens  

**Fix:** Token blacklist or refresh tokens

---

#### 15. **Error Messages Leak Info**
**Current:** "User not found" vs "Invalid credentials"  
**Risk:** Username enumeration  
**Impact:** Attacker knows valid emails  

**Fix:** Generic error messages

---

## 🛠️ Implementation Plan

### **Phase 1: Critical Fixes (Do Now!)**

#### ✅ **1. Strengthen JWT Secret**

**Action:** Generate secure random key:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Update `.env`:
```env
JWT_SECRET=<generated-64-byte-hex-string>
```

---

#### ✅ **2. Add Request Size Limits**

Update `server.ts`:
```typescript
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
```

---

#### ✅ **3. Enhanced Helmet Configuration**

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'checkout.razorpay.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'http://localhost:5000', 'https:'],
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
```

---

#### ✅ **4. Install Security Packages**

```bash
cd backend
npm install express-mongo-sanitize express-validator winston hpp
npm install --save-dev @types/express-mongo-sanitize
```

---

#### ✅ **5. Add Input Sanitization**

Create `backend/src/middlewares/sanitize.ts`:
```typescript
import mongoSanitize from 'express-mongo-sanitize'
import { Request, Response, NextFunction } from 'express'

export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
})

export const sanitizeStrings = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim()
        // Remove potential XSS
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      }
    })
  }
  next()
}
```

Add to `server.ts`:
```typescript
import { sanitizeInput, sanitizeStrings } from './middlewares/sanitize'

app.use(sanitizeInput)
app.use(sanitizeStrings)
```

---

#### ✅ **6. Stricter Rate Limiting**

Create `backend/src/middlewares/rateLimiter.ts`:
```typescript
import rateLimit from 'express-rate-limit'

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again after 15 minutes.',
})

// Payment endpoint limit
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: 'Too many payment attempts, please try again later.',
})

// File upload limit
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Too many file uploads, please try again later.',
})
```

Apply to routes:
```typescript
// In authRoutes.ts
import { authLimiter } from '../middlewares/rateLimiter'

router.post('/login', authLimiter, validate(loginSchema), login)
router.post('/signup', authLimiter, validate(signupSchema), validateMaharashtra, signup)

// In orderRoutes.ts
import { paymentLimiter } from '../middlewares/rateLimiter'

router.post('/:orderId/payment-intent', authenticate, paymentLimiter, createPaymentIntent)

// In productRoutes.ts
import { uploadLimiter } from '../middlewares/rateLimiter'

router.post('/upload-image', authenticate, authorize('ADMIN'), uploadLimiter, upload.single('image'), ...)
```

---

#### ✅ **7. Add Logging**

Create `backend/src/utils/logger.ts`:
```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
}

export default logger
```

Create `backend/src/middlewares/securityLogger.ts`:
```typescript
import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

export const logSecurityEvents = (req: Request, res: Response, next: NextFunction) => {
  // Log failed auth attempts
  res.on('finish', () => {
    if (req.path.includes('/auth/login') && res.statusCode === 401) {
      logger.warn('Failed login attempt', {
        ip: req.ip,
        email: req.body.email,
        timestamp: new Date().toISOString(),
      })
    }

    // Log admin actions
    if (req.path.includes('/admin') && res.statusCode < 400) {
      logger.info('Admin action', {
        user: (req as any).user?.email,
        method: req.method,
        path: req.path,
        ip: req.ip,
      })
    }

    // Log payment attempts
    if (req.path.includes('/payment') || req.path.includes('/order')) {
      logger.info('Payment/Order event', {
        user: (req as any).user?.email,
        method: req.method,
        path: req.path,
        status: res.statusCode,
      })
    }
  })

  next()
}
```

---

#### ✅ **8. Enforce HTTPS in Production**

Add to `server.ts`:
```typescript
// Force HTTPS in production
if (config.nodeEnv === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}
```

---

#### ✅ **9. Improve Error Messages**

Update `authController.ts`:
```typescript
// BEFORE (leaks info):
if (!user) {
  res.status(401).json({ message: 'User not found' })  // ❌ Bad
}

// AFTER (generic):
if (!user || !isValidPassword) {
  res.status(401).json({ message: 'Invalid email or password' })  // ✅ Good
}
```

---

#### ✅ **10. Validate File Uploads**

Update `backend/src/middlewares/upload.ts`:
```typescript
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `product-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

// Strict file filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file extension
  const allowedExts = /jpeg|jpg|png|gif|webp/
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase())
  
  // Check MIME type
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const mimetype = allowedMimes.includes(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed!'))
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // 1 file at a time
  },
  fileFilter,
})
```

---

### **Phase 2: Medium Priority (Next Week)**

#### ✅ **11. Account Lockout**

Create `backend/src/utils/accountLockout.ts`:
```typescript
// Simple in-memory store (use Redis in production)
const loginAttempts = new Map<string, { count: number; lockedUntil?: Date }>()

export const checkAccountLockout = (email: string): boolean => {
  const attempt = loginAttempts.get(email)
  if (!attempt) return false

  if (attempt.lockedUntil && attempt.lockedUntil > new Date()) {
    return true // Still locked
  }

  return false
}

export const recordFailedLogin = (email: string): void => {
  const attempt = loginAttempts.get(email) || { count: 0 }
  attempt.count++

  if (attempt.count >= 5) {
    attempt.lockedUntil = new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 min
  }

  loginAttempts.set(email, attempt)
}

export const resetLoginAttempts = (email: string): void => {
  loginAttempts.delete(email)
}
```

Use in `authController.ts`:
```typescript
import { checkAccountLockout, recordFailedLogin, resetLoginAttempts } from '../utils/accountLockout'

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  // Check if account is locked
  if (checkAccountLockout(email)) {
    res.status(429).json({ message: 'Account temporarily locked. Try again in 15 minutes.' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  const isValidPassword = user && await comparePassword(password, user.password)

  if (!user || !isValidPassword) {
    recordFailedLogin(email)
    res.status(401).json({ message: 'Invalid email or password' })
    return
  }

  // Reset on successful login
  resetLoginAttempts(email)

  // ... rest of login logic
}
```

---

#### ✅ **12. Password Strength Validation**

Update `backend/src/validators/index.ts`:
```typescript
export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-zA-Z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
      'string.min': 'Password must be at least 8 characters long',
    }),
  name: Joi.string().min(2).required(),
  phone: Joi.string().pattern(/^[6-9]\\d{9}$/).required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().required(),
  pincode: Joi.string().pattern(/^\\d{6}$/).required(),
})
```

---

## 📋 Security Checklist

### **Must-Do Now:**
- [ ] Generate new strong JWT_SECRET
- [ ] Add request size limits
- [ ] Enhance Helmet configuration
- [ ] Install security packages
- [ ] Add input sanitization
- [ ] Implement stricter rate limiting
- [ ] Add logging system
- [ ] Enforce HTTPS in production
- [ ] Fix error messages (no info leakage)
- [ ] Validate file uploads properly

### **Do This Week:**
- [ ] Add account lockout
- [ ] Enforce password strength
- [ ] Add .gitignore for .env
- [ ] Review all admin endpoints
- [ ] Test Razorpay webhook validation
- [ ] Add CSRF protection
- [ ] Implement JWT refresh tokens

### **Nice to Have:**
- [ ] Email verification
- [ ] 2FA authentication
- [ ] Security audit logs
- [ ] Automated security testing
- [ ] Penetration testing
- [ ] Bug bounty program

---

## 🔍 Testing Security

### **1. Test Rate Limiting:**
```bash
# Try 6 rapid login attempts
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Should block after 5 attempts
```

### **2. Test File Upload:**
```bash
# Try uploading non-image file
curl -X POST http://localhost:5000/api/products/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@malicious.exe"
# Should reject
```

### **3. Test JWT Expiration:**
```bash
# Use expired/invalid token
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer invalid_token"
# Should return 401
```

---

## 🚨 Emergency Response Plan

### **If Breach Detected:**
1. Immediately rotate all API keys (Razorpay, JWT secret)
2. Force logout all users (invalidate all tokens)
3. Review logs for attack pattern
4. Notify affected users
5. Patch vulnerability
6. Conduct security audit

### **Incident Checklist:**
- [ ] Identify attack vector
- [ ] Stop the attack
- [ ] Assess damage
- [ ] Preserve evidence (logs)
- [ ] Notify stakeholders
- [ ] Fix vulnerability
- [ ] Update security measures
- [ ] Document lessons learned

---

## 📞 Security Resources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Node.js Security:** https://nodejs.org/en/docs/guides/security/
- **Express Security:** https://expressjs.com/en/advanced/best-practice-security.html
- **Helmet Docs:** https://helmetjs.github.io/

**Your app has good basic security, but needs these critical fixes!** 🔒
