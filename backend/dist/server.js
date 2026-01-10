"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const errorHandler_1 = require("./middlewares/errorHandler");
const sanitize_1 = require("./middlewares/sanitize");
const securityLogger_1 = require("./middlewares/securityLogger");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const logger_1 = __importDefault(require("./utils/logger"));
const connectionPool_1 = require("./utils/connectionPool");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const app = (0, express_1.default)();
const uploadDir = '/var/data/uploads';
// Trust proxy (for rate limiting and logging)
app.set('trust proxy', 1);
// Security middleware
app.use((0, helmet_1.default)({
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
}));
// CORS
app.use((0, cors_1.default)({
    origin: config_1.config.frontendUrl,
    credentials: true,
}));
// Body parser with size limits
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Sanitize input
app.use(sanitize_1.sanitizeInput);
app.use(sanitize_1.sanitizeStrings);
// Security logging
app.use(securityLogger_1.logSecurityEvents);
// Rate limiting
app.use('/api/', rateLimiter_1.apiLimiter);
// Serve uploaded files with proper path resolution
const path = require('path');
app.use('/uploads', express_1.default.static(uploadDir, {
    maxAge: '7d',
    immutable: true,
    setHeaders: (res, filePath) => {
        if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        }
        if (filePath.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
        }
    }
}));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/cart', cartRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Error handler
app.use(errorHandler_1.errorHandler);
const PORT = config_1.config.port;
const startServer = async () => {
    try {
        // Initialize database connection pool
        await (0, connectionPool_1.initializeConnectionPool)();
        app.listen(PORT, () => {
            logger_1.default.info(`🚀 Server running on port ${PORT}`);
            logger_1.default.info(`📝 Environment: ${config_1.config.nodeEnv}`);
            logger_1.default.info(`🌐 Frontend URL: ${config_1.config.frontendUrl}`);
            logger_1.default.info(`🔒 Security: Enabled`);
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${config_1.config.nodeEnv}`);
            console.log(`🌐 Frontend URL: ${config_1.config.frontendUrl}`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
