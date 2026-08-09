"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.initializeApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const errorHandler_1 = require("./middlewares/errorHandler");
const sanitize_1 = require("./middlewares/sanitize");
const securityLogger_1 = require("./middlewares/securityLogger");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const logger_1 = __importDefault(require("./utils/logger"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const connectionPool_1 = require("./utils/connectionPool");
const redis_1 = require("./config/redis");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/wishlistRoutes"));
const mediaRoutes_1 = __importDefault(require("./routes/mediaRoutes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
const roleChangeRoutes_1 = __importDefault(require("./routes/roleChangeRoutes"));
const multiAccountRoutes_1 = __importDefault(require("./routes/multiAccountRoutes"));
const deliveryRoutes_1 = __importDefault(require("./routes/deliveryRoutes"));
const faqRoutes_1 = __importDefault(require("./routes/faqRoutes"));
const flashSaleRoutes_1 = __importDefault(require("./routes/flashSaleRoutes"));
const newsletterRoutes_1 = __importDefault(require("./routes/newsletterRoutes"));
const app = (0, express_1.default)();
// Upload directory configuration (Render persistent disk in production)
const uploadDir = process.env.NODE_ENV === "production" ? "/var/data/uploads" : "./uploads";
// Trust proxy (for rate limiting and logging)
app.set("trust proxy", 1);
// Security middleware
app.use((0, helmet_1.default)({
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
}));
// CORS
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        // Clean the incoming origin (remove trailing slash if any)
        const cleanOrigin = origin.replace(/\/$/, "");
        const allowedOrigins = [config_1.config.frontendUrl.replace(/\/$/, "")];
        if (process.env.VERCEL_URL) {
            allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
        }
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
            const url = new URL(config_1.config.frontendUrl);
            const hostname = url.hostname;
            const protocol = url.protocol;
            const port = url.port ? `:${url.port}` : "";
            if (hostname !== "localhost" &&
                hostname !== "127.0.0.1" &&
                hostname !== "[::1]") {
                if (hostname.startsWith("www.")) {
                    allowedOrigins.push(`${protocol}//${hostname.replace("www.", "")}${port}`);
                }
                else {
                    allowedOrigins.push(`${protocol}//www.${hostname}${port}`);
                }
            }
        }
        catch (err) {
            // Fallback to just the config URL if parsing fails
        }
        // Check if the clean origin is in our allowed list
        const isVercelPreview = process.env.VERCEL === "1" &&
            /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(cleanOrigin);
        const isAllowed = isVercelPreview ||
            allowedOrigins.some((allowed) => allowed.replace(/\/$/, "") === cleanOrigin);
        if (isAllowed) {
            callback(null, true);
        }
        else {
            logger_1.default.error(`CORS blocked request from origin: ${origin}`);
            logger_1.default.debug(`Allowed origins were: ${allowedOrigins.join(", ")}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Body parser with size limits
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cookie_parser_1.default)());
app.use((req, res, next) => {
    const startedAt = Date.now();
    logger_1.default.info(`API request started: ${req.method} ${req.originalUrl}`);
    res.on("finish", () => {
        logger_1.default.info(`API request finished: ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
    });
    next();
});
// // Cookie parser - for secure httpOnly cookie handling
// // Supports both httpOnly cookies and query parameter fallback for legacy clients
// app.use((req: Request, res: Response, next) => {
//   // Parse cookies from headers manually since we don't use cookie-parser
//   const cookieHeader = req.headers.cookie;
//   (req as any).cookies = {};
//   if (cookieHeader) {
//     const cookies: Record<string, string> = {};
//     cookieHeader.split(";").forEach((cookie) => {
//       const parts = cookie.split("=");
//       if (parts.length >= 2) {
//         const key = parts[0].trim();
//         const val = parts.slice(1).join("=").trim();
//         if (key && val) {
//           try {
//             cookies[key] = decodeURIComponent(val);
//           } catch (e) {
//             cookies[key] = val; // Fallback if decode fails
//           }
//         }
//       }
//     });
//     (req as any).cookies = cookies;
//   }
//   next();
// });
// Sanitize input
app.use(sanitize_1.sanitizeInput);
app.use(sanitize_1.sanitizeStrings);
// Security logging
app.use(securityLogger_1.logSecurityEvents);
// Cookie-authenticated mutations rely on cookie SameSite/Secure policy.
// Rate limiting
app.use("/api/", rateLimiter_1.apiLimiter);
// Serve uploaded files with proper path resolution
const path = require("path");
app.use("/uploads", express_1.default.static(uploadDir, {
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
}));
// Health check
app.get("/api/ping", (req, res) => {
    res.json({
        status: "ok",
        runtime: "vercel",
        timestamp: new Date().toISOString(),
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    });
});
app.get("/health", async (req, res) => {
    try {
        const isDbHealthy = await (0, connectionPool_1.checkConnectionHealth)();
        const status = isDbHealthy ? "UP" : "DEGRADED";
        const statusCode = isDbHealthy ? 200 : 503;
        res.status(statusCode).json({
            status,
            timestamp: new Date().toISOString(),
            database: isDbHealthy ? "connected" : "disconnected",
            uptime: process.uptime(),
        });
    }
    catch (error) {
        res.status(503).json({
            status: "DOWN",
            timestamp: new Date().toISOString(),
            database: "error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/cart", cartRoutes_1.default);
app.use("/api/products/media", mediaRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/cart", cartRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/wishlist", wishlistRoutes_1.default);
app.use("/api/coupons", couponRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/addresses", addressRoutes_1.default);
app.use("/api/role-change", roleChangeRoutes_1.default);
app.use("/api/accounts", multiAccountRoutes_1.default);
app.use("/api/delivery", deliveryRoutes_1.default);
app.use("/api/faqs", faqRoutes_1.default);
app.use("/api/flash-sales", flashSaleRoutes_1.default);
app.use("/api/newsletters", newsletterRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
// Error handler
app.use(errorHandler_1.errorHandler);
const PORT = config_1.config.port;
const initializeApp = async () => {
    try {
        if (process.env.VERCEL === "1") {
            logger_1.default.info("Skipping startup database health check on Vercel");
        }
        else {
            // Initialize database connection pool
            await (0, connectionPool_1.initializeConnectionPool)();
        }
        // ✅ SECURITY: Initialize Redis for token blacklist and session management
        await (0, redis_1.initializeRedis)();
    }
    catch (error) {
        logger_1.default.error("Failed to initialize app:", error);
        throw error;
    }
};
exports.initializeApp = initializeApp;
const startServer = async () => {
    try {
        await (0, exports.initializeApp)();
        app.listen(PORT, () => {
            logger_1.default.info(`🚀 Server running on port ${PORT}`);
            logger_1.default.info(`📝 Environment: ${config_1.config.nodeEnv}`);
            logger_1.default.info(`🌐 Frontend URL: ${config_1.config.frontendUrl}`);
            logger_1.default.info(`🔒 Security: Enabled`);
        });
    }
    catch (error) {
        logger_1.default.error("Failed to start server:", error);
        process.exit(1);
    }
};
exports.startServer = startServer;
if (!process.env.VERCEL) {
    (0, exports.startServer)();
}
exports.default = app;
