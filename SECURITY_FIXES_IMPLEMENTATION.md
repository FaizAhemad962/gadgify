# Security Fixes - Implementation Guide

## CRITICAL FIXES (Do First - 4-6 hours)

### 1️⃣ Fix Default JWT Secret

**File**: `backend/src/config/index.ts`

**Current Code** ❌:

```typescript
export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "your-secret-key", // ❌ CRITICAL!
};
```

**Fixed Code** ✅:

```typescript
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "JWT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET!, // Will throw if not set
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h", // Also reduced to 24 hours
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID!,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET!,
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "Gadgify <onboarding@resend.dev>",
  adminEmail: process.env.ADMIN_EMAIL || "",
};
```

**Required .env variables**:

```bash
JWT_SECRET=your-super-secret-key-min-32-chars-long
RAZORPAY_KEY_ID=rzp_live_XXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXX
JWT_EXPIRES_IN=24h
DATABASE_URL=postgresql://...
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

---

### 2️⃣ Move JWT from localStorage to httpOnly Cookies

**File**: `backend/src/controllers/authController.ts`

**Current Code** ❌:

```typescript
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // ... auth logic ...

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(200).json({ token, user }); // ❌ Token sent in body
};
```

**Fixed Code** ✅:

```typescript
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // ... auth logic ...

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // ✅ Set httpOnly cookie
  res.cookie("authToken", token, {
    httpOnly: true, // Can't be accessed via JavaScript (XSS safe)
    secure: process.env.NODE_ENV === "production", // HTTPS only
    sameSite: "strict", // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: "/", // Available to all routes
  });

  // Return user data, but NOT the token
  res.status(200).json({
    user,
    message: "Login successful",
  });
};
```

**Also update signup/signup.ts**:

```typescript
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // ... user creation logic ...

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // ✅ Set cookie instead of returning token
  res.cookie("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(201).json({ user });
};
```

**File**: `frontend/src/context/AuthContext.tsx`

**Current Code** ❌:

```typescript
const getStoredAuth = () => {
  const storedToken = localStorage.getItem("token"); // ❌ Vulnerable to XSS
  const storedUser = localStorage.getItem("user");

  if (storedToken && storedUser) {
    return { token: storedToken, user: JSON.parse(storedUser) as User };
  }
  return { token: null, user: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const stored = getStoredAuth();
  const [user, setUser] = useState<User | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken); // ❌ Not secure
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };
};
```

**Fixed Code** ✅:

```typescript
const getStoredAuth = () => {
  // Try to get user from localStorage (for persistence)
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    return { user: JSON.parse(storedUser) as User };
  }
  return { user: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const stored = getStoredAuth();
  const [user, setUser] = useState<User | null>(stored.user);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    // ✅ Token is automatically sent via httpOnly cookie by browser
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // ✅ Token cleared via server-side logout call (see below)
  };

  // ... rest of context
};
```

**File**: `frontend/src/api/client.ts`

**Current Code** ❌:

```typescript
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem("token"); // ❌ Manually adding token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  // ...
);
```

**Fixed Code** ✅:

```typescript
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true, // ✅ Include cookies in requests
});

// Token is now automatically sent via httpOnly cookie
// No need for Authorization header
apiClient.interceptors.request.use(
  (config: any) => {
    // ✅ Token is in httpOnly cookie, no need to add it manually
    // Initialize retry count
    if (!config.retryCount) {
      config.retryCount = 0;
    }
    return config;
  },
  // ...
);
```

**File**: `frontend/src/api/auth.ts`

**Current Code** ❌:

```typescript
logout: () => {
  localStorage.removeItem("token");  // ❌ Only client-side
  localStorage.removeItem("user");
},
```

**Fixed Code** ✅:

```typescript
logout: async () => {
  try {
    // ✅ Call backend to invalidate session
    await apiClient.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("user");
    // Cookie is automatically cleared by browser
  }
},
```

**Backend**: Add logout endpoint in `authRoutes.ts`:

```typescript
router.post("/logout", authenticate, logout);
```

**Backend controller** `authController.ts`:

```typescript
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // ✅ Clear the cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    // Optionally: Add token to blacklist if implementing server-side logout
    // const token = req.headers.authorization?.replace("Bearer ", "");
    // if (token) tokenBlacklist.add(token);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
```

---

### 3️⃣ Migrate CSRF Tokens to Redis

**File**: `backend/src/middlewares/csrfProtection.ts`

**Current Code** ❌:

```typescript
const csrfTokenStore = new Map<string, { timestamp: number }>(); // ❌ In-memory only

export const verifyCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // ... check Map ...
};
```

**Fixed Code** ✅:

First, install Redis client:

```bash
npm install redis
```

**New file**: `backend/src/config/redis.ts`

```typescript
import redis from "redis";
import { config } from "./index";

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.disconnect();
  }
};

export default redisClient;
```

**Updated**: `backend/src/middlewares/csrfProtection.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import redisClient from "../config/redis";

const TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const csrfTokenGenerator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = generateCSRFToken();

    // ✅ Store in Redis with expiration
    await redisClient.setEx(`csrf:${token}`, TOKEN_EXPIRY, "1");

    res.locals.csrfToken = token;
    (req as any).csrfToken = token;

    next();
  } catch (error) {
    res.status(500).json({ message: "Failed to generate CSRF token" });
  }
};

export const verifyCsrfToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  try {
    const token =
      (req.headers["x-csrf-token"] as string) || req.body?.csrfToken;

    if (!token) {
      return res.status(403).json({ message: "CSRF token is required" });
    }

    // ✅ Check Redis
    const exists = await redisClient.exists(`csrf:${token}`);

    if (!exists) {
      return res.status(403).json({ message: "Invalid or expired CSRF token" });
    }

    // ✅ Delete token after use (one-time use)
    await redisClient.del(`csrf:${token}`);

    next();
  } catch (error) {
    res.status(500).json({ message: "CSRF verification failed" });
  }
};

// No need for cleanup function - Redis handles expiration
```

**Update**: `backend/src/server.ts`

```typescript
import { connectRedis, disconnectRedis } from "./config/redis";

const startServer = async () => {
  try {
    // ✅ Connect Redis
    await connectRedis();

    // Start express server
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully");
      await disconnectRedis();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("SIGINT received, shutting down gracefully");
      await disconnectRedis();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
```

---

### 4️⃣ Remove console.log from orderController

**File**: `backend/src/controllers/orderController.ts`

**Current Code** ❌:

```typescript
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    console.log("--------- req body", req.body);  // ❌ REMOVE THIS
    const { items, subtotal, shipping, total, shippingAddress, couponCode } =
      req.body;
```

**Fixed Code** ✅:

```typescript
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // ✅ Use logger for development debugging only
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[createOrder] User ${req.user!.id} creating order`, {
        itemCount: req.body.items?.length,
        subtotal: req.body.subtotal,
      });
    }

    const { items, subtotal, shipping, total, shippingAddress, couponCode } =
      req.body;
```

---

## HIGH-RISK FIXES (4-6 hours)

### 5️⃣ Fix Password Validation Inconsistency

**File**: `backend/src/validators/index.ts`

**Current Code** ❌:

```typescript
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(), // ❌ Only 6 chars!
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(), // ❌ Inconsistent
  // ...
});
```

**Fixed Code** ✅:

```typescript
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(), // ✅ Match signup
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(), // ✅ 8 chars minimum
  name: Joi.string().min(2).required(),
  phone: Joi.string().min(10).required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().min(5).required(),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
});
```

---

### 6️⃣ Add Special Character Requirement

**File**: `backend/src/middlewares/securityValidator.ts`

**Current Code** ❌:

```typescript
export const validatePasswordStrength = (
  password: string,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
```

**Fixed Code** ✅:

```typescript
export const validatePasswordStrength = (
  password: string,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // ✅ Add special character requirement
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&*)",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
```

---

### 7️⃣ Reduce JWT Expiration & Add Password Reset Rate Limit

**File**: `backend/src/config/index.ts`

Already covered in Fix #1, but ensure:

```typescript
jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",  // Changed from "7d"
```

**File**: `backend/src/middlewares/rateLimiter.ts`

**Add new limiter**:

```typescript
// Strict limit for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 reset attempts per hour
  skipSuccessfulRequests: true,
  message: "Too many password reset attempts. Please try again in 1 hour.",
  keyGenerator: (req) => req.body?.email || req.ip, // Key by email
});
```

**File**: `backend/src/routes/authRoutes.ts`

**Update routes**:

```typescript
import { passwordResetLimiter } from "../middlewares/rateLimiter";

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);

router.post(
  "/reset-password",
  passwordResetLimiter, // ✅ Use stricter limiter
  validate(resetPasswordSchema),
  resetPassword,
);
```

---

### 8️⃣ Implement Token Blacklist for Logout

**File**: `backend/src/config/redis.ts` (or `utils/tokenBlacklist.ts`)

```typescript
import redisClient from "../config/redis";

const BLACKLIST_EXPIRY = 24 * 60 * 60; // 24 hours

export const blacklistToken = async (token: string): Promise<void> => {
  const decoded = jwt.decode(token) as any;
  if (decoded?.exp) {
    const expiresIn = Math.floor(decoded.exp - Date.now() / 1000);
    if (expiresIn > 0) {
      await redisClient.setEx(`blacklist:${token}`, expiresIn, "1");
    }
  }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  return !!(await redisClient.exists(`blacklist:${token}`));
};
```

**File**: `backend/src/middlewares/auth.ts`

```typescript
import { isTokenBlacklisted } from "../utils/tokenBlacklist";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // ✅ Check if token is blacklisted
    if (await isTokenBlacklisted(token)) {
      res.status(401).json({ message: "Token has been revoked" });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: string;
    };

    // ... rest of auth logic ...
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
```

**File**: `backend/src/controllers/authController.ts`

Add logout endpoint:

```typescript
import { blacklistToken } from "../utils/tokenBlacklist";

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      // ✅ Add to blacklist
      await blacklistToken(token);
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
```

---

### 9️⃣ Validate File Content (Magic Bytes)

**File**: `backend/src/middlewares/upload.ts`

Install required package:

```bash
npm install file-type
```

**Fixed Code** ✅:

```typescript
import fileType from "file-type";

// File filter for images - validate actual file content
const imageFileFilter = async (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  try {
    // ✅ Check actual file content, not just MIME type
    const type = await fileType.fileTypeFromBuffer(file.buffer);

    if (!type || !type.mime.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }

    // Also check against whitelist
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(type.mime)) {
      return cb(new Error("Image format not supported"));
    }

    cb(null, true);
  } catch (error) {
    cb(error as Error);
  }
};

// Similar for videos
const videoFileFilter = async (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  try {
    const type = await fileType.fileTypeFromBuffer(file.buffer);

    if (!type || !type.mime.startsWith("video/")) {
      return cb(new Error("Only video files are allowed!"));
    }

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(type.mime)) {
      return cb(new Error("Video format not supported"));
    }

    cb(null, true);
  } catch (error) {
    cb(error as Error);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});

export const videoUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: videoFileFilter,
});
```

---

### 🔟 Add User Enumeration Protection

**File**: `backend/src/controllers/authController.ts`

**Current Code** ❌:

```typescript
if (emailAlreadyRegistered) {
  res.status(400).json({ message: "Email already registered" }); // ❌ Reveals email exists
  return;
}
```

**Fixed Code** ✅:

```typescript
if (emailAlreadyRegistered) {
  // ✅ Generic message doesn't reveal if email exists
  res.status(400).json({
    message:
      "Unable to create account. If you have an existing account, please sign in or use the password reset option.",
  });
  return;
}
```

---

## Testing the Fixes

### Test Commands

```bash
# 1. Test JWT validation fails without JWT_SECRET
unset JWT_SECRET
npm run dev  # Should fail with error

# 2. Test httpOnly cookie is set
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@"}'
# Should see: Set-Cookie: authToken=...; HttpOnly; Secure; ...

# 3. Test CSRF tokens expire in Redis
redis-cli
KEYS csrf:*
# Should be cleaned up after 1 hour

# 4. Test password validation
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak"}'
# Should fail: "Password must be at least 8 characters long"

# 5. Test password reset rate limit
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
done
# 4th request should be rate limited
```

---

## Deployment Checklist

- [ ] All environment variables configured in `.env`
- [ ] Redis instance running (production)
- [ ] JWT_SECRET is strong (min 32 characters, random)
- [ ] HTTPS enabled in production
- [ ] FRONTEND_URL set correctly
- [ ] Database backups configured
- [ ] Logging aggregation set up
- [ ] Run `npm audit` and fix any vulnerabilities
- [ ] Security headers validated
- [ ] Rate limits tested
- [ ] Payment integration tested with real API keys
- [ ] Email sending tested

---

See [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) for complete audit details.
