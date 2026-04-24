"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = void 0;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = __importDefault(require("../utils/logger"));
const getDashboardAnalytics = async (req, res, next) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        // Run all queries in parallel
        const [totalUsers, totalProducts, totalOrders, revenueThisMonth, revenueLastMonth, ordersByStatus, recentOrders, topProducts, dailyRevenue, lowStockProducts,] = await Promise.all([
            // Total users
            database_1.default.user.count({ where: { role: "USER", deletedAt: null } }),
            // Total active products
            database_1.default.product.count({ where: { deletedAt: null } }),
            // Total orders
            database_1.default.order.count({ where: { deletedAt: null } }),
            // Revenue this month (only completed payments)
            database_1.default.order.aggregate({
                where: {
                    paymentStatus: "COMPLETED",
                    deletedAt: null,
                    createdAt: { gte: startOfThisMonth },
                },
                _sum: { total: true },
            }),
            // Revenue last month
            database_1.default.order.aggregate({
                where: {
                    paymentStatus: "COMPLETED",
                    deletedAt: null,
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
                _sum: { total: true },
            }),
            // Orders grouped by status
            database_1.default.order.groupBy({
                by: ["status"],
                where: { deletedAt: null },
                _count: { id: true },
            }),
            // Recent 10 orders
            database_1.default.order.findMany({
                where: { deletedAt: null },
                orderBy: { createdAt: "desc" },
                take: 10,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    items: { select: { quantity: true } },
                },
            }),
            // Top 5 selling products (by quantity sold)
            database_1.default.orderItem.groupBy({
                by: ["productId"],
                where: { deletedAt: null },
                _sum: { quantity: true, price: true },
                orderBy: { _sum: { quantity: "desc" } },
                take: 5,
            }),
            // Daily revenue for last 30 days (raw query for date grouping)
            database_1.default.$queryRawUnsafe(`SELECT 
          TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
          COALESCE(SUM("total"), 0)::float as revenue,
          COUNT(*)::int as orders
        FROM orders
        WHERE "paymentStatus" = 'COMPLETED'
          AND "deletedAt" IS NULL
          AND "createdAt" >= $1
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
        ORDER BY date ASC`, thirtyDaysAgo),
            // Low stock products (stock <= 5)
            database_1.default.product.findMany({
                where: { deletedAt: null, stock: { lte: 5 } },
                select: { id: true, name: true, stock: true, category: true },
                orderBy: { stock: "asc" },
                take: 10,
            }),
        ]);
        // Format status distribution
        const statusDistribution = ordersByStatus.map((item) => ({
            status: item.status,
            count: item._count.id,
        }));
        // Format revenue chart
        const revenueChart = dailyRevenue.map((item) => ({
            date: item.date,
            revenue: item.revenue,
            orders: item.orders,
        }));
        // Format top products with product details
        const topProductsData = await Promise.all(topProducts.map(async (item) => {
            const product = await database_1.default.product.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, price: true, category: true },
            });
            return {
                productId: item.productId,
                name: product?.name || "Unknown",
                price: product?.price || 0,
                category: product?.category || "Unknown",
                totalQuantitySold: item._sum.quantity || 0,
                totalRevenue: item._sum.price || 0,
            };
        }));
        // Format recent orders
        const formattedRecentOrders = recentOrders.map((order) => ({
            id: order.id,
            userId: order.userId,
            userName: order.user?.name || "Unknown",
            userEmail: order.user?.email || "Unknown",
            status: order.status,
            paymentStatus: order.paymentStatus,
            total: order.total,
            itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
            createdAt: order.createdAt,
        }));
        res.json({
            success: true,
            data: {
                summary: {
                    totalUsers,
                    totalProducts,
                    totalOrders,
                    revenueThisMonth: revenueThisMonth._sum.total || 0,
                    revenueLastMonth: revenueLastMonth._sum.total || 0,
                },
                statusDistribution,
                revenueChart,
                topProducts: topProductsData,
                recentOrders: formattedRecentOrders,
                lowStockProducts,
            },
        });
    }
    catch (error) {
        // SECURITY: Log error to logger, not to console (may expose sensitive data)
        logger_1.default.error(`Analytics error: ${error instanceof Error ? error.message : String(error)}`);
        next(error);
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
