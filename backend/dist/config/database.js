"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
});
const withTimeout = async (promise, timeoutMs, message) => {
    let timeout;
    const timeoutPromise = new Promise((_, reject) => {
        timeout = setTimeout(() => {
            const error = new Error(message);
            error.statusCode = 503;
            error.isOperational = true;
            reject(error);
        }, timeoutMs);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    }
    finally {
        if (timeout) {
            clearTimeout(timeout);
        }
    }
};
if (process.env.VERCEL === '1') {
    prisma.$use(async (params, next) => {
        return withTimeout(next(params), 8000, `Database query timed out: ${params.model || 'raw'}.${params.action}`);
    });
}
// Guard against destructive deletes in production for critical models
prisma.$use(async (params, next) => {
    if (process.env.NODE_ENV === 'production') {
        const dangerous = params.action === 'delete' || params.action === 'deleteMany';
        const protectedModels = ['User', 'Product', 'Order'];
        if (dangerous && params.model && protectedModels.includes(params.model)) {
            throw new Error('Destructive delete blocked in production');
        }
    }
    return next(params);
});
// Handle disconnection on app termination
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
exports.default = prisma;
