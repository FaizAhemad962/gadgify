import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler } from "./middlewares/errorHandler";
import { sanitizeInput, sanitizeStrings } from "./middlewares/sanitize";
import { logSecurityEvents } from "./middlewares/securityLogger";
import { verifyCsrfToken } from "./middlewares/csrfProtection";
import { apiLimiter } from "./middlewares/rateLimiter";
import logger from "./utils/logger";

// Extend Express Response type for custom setCookie method
declare global {
  namespace Express {
    interface Response {
      setCookie: (name: string, value: string, options?: any) => void;
    }
  }
}
import {
  initializeConnectionPool,
  checkConnectionHealth,
} from "./utils/connectionPool";
import { initializeRedis } from "./config/redis";
import { runStartupDiagnostics } from "./utils/startupDiagnostics";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import couponRoutes from "./routes/couponRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import addressRoutes from "./routes/addressRoutes";
import roleChangeRoutes from "./routes/roleChangeRoutes";
import multiAccountRoutes from "./routes/multiAccountRoutes";
import deliveryRoutes from "./routes/deliveryRoutes";
import faqRoutes from "./routes/faqRoutes";
import flashSaleRoutes from "./routes/flashSaleRoutes";
import newsletterRoutes from "./routes/newsletterRoutes";

const app: Application = express();

// Upload directory configuration (Render persistent disk in production)
const uploadDir =
  process.env.NODE_ENV === "production" ? "/var/data/uploads" : "./uploads";

// Trust proxy (for rate limiting and logging)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "checkout.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: [
          "'self'",
          "data:",
          "http://localhost:5000",
          "http://localhost:3000",
          "https:",
        ],
        connectSrc: ["'self'", "https://api.razorpay.com"],
        frameSrc: ["'self'", "https://api.razorpay.com"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
  }),
);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Clean the incoming origin (remove trailing slash if any)
      const cleanOrigin = origin.replace(/\/$/, "");

      const allowedOrigins = [config.frontendUrl.replace(/\/$/, "")];

      // Add common development origins if in development mode
      if (process.env.NODE_ENV !== "production") {
        allowedOrigins.push("http://localhost:3000");
        allowedOrigins.push("http://localhost:5173");
        allowedOrigins.push("http://127.0.0.1:3000");
        allowedOrigins.push("http://127.0.0.1:5173");
        allowedOrigins.push("http://[::1]:3000");
        allowedOrigins.push("http://[::1]:5173");
      }

      // Automatically allow www/non-www variations of the frontend URL
      try {
        const url = new URL(config.frontendUrl);
        const hostname = url.hostname;
        const protocol = url.protocol;
        const port = url.port ? `:${url.port}` : "";

        if (
          hostname !== "localhost" &&
          hostname !== "127.0.0.1" &&
          hostname !== "[::1]"
        ) {
          if (hostname.startsWith("www.")) {
            allowedOrigins.push(
              `${protocol}//${hostname.replace("www.", "")}${port}`,
            );
          } else {
            allowedOrigins.push(`${protocol}//www.${hostname}${port}`);
          }
        }
      } catch (err) {
        // Fallback to just the config URL if parsing fails
      }

      // Check if the clean origin is in our allowed list
      const isAllowed = allowedOrigins.some(
        (allowed) => allowed.replace(/\/$/, "") === cleanOrigin,
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.error(`CORS blocked request from origin: ${origin}`);
        logger.debug(`Allowed origins were: ${allowedOrigins.join(", ")}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Body parser with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser - for secure httpOnly cookie handling
// Supports both httpOnly cookies and query parameter fallback for legacy clients
app.use((req: Request, res: Response, next) => {
  // Parse cookies from headers manually since we don't use cookie-parser
  const cookieHeader = req.headers.cookie;
  (req as any).cookies = {};

  if (cookieHeader) {
    const cookies: Record<string, string> = {};
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join("=").trim();
        if (key && val) {
          try {
            cookies[key] = decodeURIComponent(val);
          } catch (e) {
            cookies[key] = val; // Fallback if decode fails
          }
        }
      }
    });
    (req as any).cookies = cookies;
  }
  next();
});

// Sanitize input
app.use(sanitizeInput);
app.use(sanitizeStrings);

// Security logging
app.use(logSecurityEvents);

// ✅ SECURITY: CSRF protection
app.use(verifyCsrfToken);

// Rate limiting
app.use("/api/", apiLimiter);

// Serve uploaded files with proper path resolution
const path = require("path");
app.use(
  "/uploads",
  express.static(uploadDir, {
    maxAge: "7d",
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
      }
      if (filePath.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) {
        res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      }
    },
  }),
);

// Health check
app.get("/health", async (req: Request, res: Response) => {
  try {
    const isDbHealthy = await checkConnectionHealth();
    const status = isDbHealthy ? "UP" : "DEGRADED";
    const statusCode = isDbHealthy ? 200 : 503;

    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      database: isDbHealthy ? "connected" : "disconnected",
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: "DOWN",
      timestamp: new Date().toISOString(),
      database: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products/media", mediaRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/role-change", roleChangeRoutes);
app.use("/api/accounts", multiAccountRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/flash-sales", flashSaleRoutes);
app.use("/api/newsletters", newsletterRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

const PORT = config.port;

const startServer = async () => {
  try {
    // Initialize database connection pool
    await initializeConnectionPool();

    // ✅ SECURITY: Initialize Redis for token blacklist and session management
    await initializeRedis();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 Frontend URL: ${config.frontendUrl}`);
      logger.info(`🔒 Security: Enabled`);
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
