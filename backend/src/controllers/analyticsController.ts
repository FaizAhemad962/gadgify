import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../middlewares/auth";

export const getDashboardAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    // Run all queries in parallel
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueThisMonth,
      revenueLastMonth,
      ordersByStatus,
      recentOrders,
      topProducts,
      dailyRevenue,
      lowStockProducts,
    ] = await Promise.all([
      // Total users
      prisma.user.count({ where: { role: "USER", deletedAt: null } }),

      // Total active products
      prisma.product.count({ where: { deletedAt: null } }),

      // Total orders
      prisma.order.count({ where: { deletedAt: null } }),

      // Revenue this month (only completed payments)
      prisma.order.aggregate({
        where: {
          paymentStatus: "COMPLETED",
          deletedAt: null,
          createdAt: { gte: startOfThisMonth },
        },
        _sum: { total: true },
      }),

      // Revenue last month
      prisma.order.aggregate({
        where: {
          paymentStatus: "COMPLETED",
          deletedAt: null,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { total: true },
      }),

      // Orders grouped by status
      prisma.order.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { id: true },
      }),

      // Recent 10 orders
      prisma.order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { select: { quantity: true } },
        },
      }),

      // Top 5 selling products (by quantity sold)
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { deletedAt: null },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),

      // Daily revenue for last 30 days (raw query for date grouping)
      prisma.$queryRawUnsafe<
        Array<{ date: string; revenue: number; orders: number }>
      >(
        `SELECT 
          TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
          COALESCE(SUM("total"), 0)::float as revenue,
          COUNT(*)::int as orders
        FROM orders
        WHERE "paymentStatus" = 'COMPLETED'
          AND "deletedAt" IS NULL
          AND "createdAt" >= $1
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
        ORDER BY date ASC`,
        thirtyDaysAgo,
      ),

      // Low stock products (stock <= 5)
      prisma.product.findMany({
        where: { deletedAt: null, stock: { lte: 5 } },
        select: { id: true, name: true, stock: true, category: true },
        orderBy: { stock: "asc" },
        take: 10,
      }),
    ]);

    // Fetch product names for top products
    const topProductIds = topProducts.map((p) => p.productId);
    const productDetails =
      topProductIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true },
          })
        : [];

    const productNameMap = new Map(productDetails.map((p) => [p.id, p.name]));

    // Build daily revenue array (fill missing days with 0)
    const dailyRevenueMap = new Map(dailyRevenue.map((d) => [d.date, d]));
    const revenueChart: Array<{
      date: string;
      revenue: number;
      orders: number;
    }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const entry = dailyRevenueMap.get(key);
      revenueChart.push({
        date: key,
        revenue: entry ? Number(entry.revenue) : 0,
        orders: entry ? Number(entry.orders) : 0,
      });
    }

    // Format order status distribution
    const statusDistribution = ordersByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));

    // Format top products
    const topProductsFormatted = topProducts.map((p) => ({
      name: productNameMap.get(p.productId) || "Unknown",
      unitsSold: p._sum.quantity || 0,
      revenue: p._sum.price || 0,
    }));

    // Revenue comparison
    const thisMonthRevenue = revenueThisMonth._sum.total || 0;
    const lastMonthRevenue = revenueLastMonth._sum.total || 0;
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : thisMonthRevenue > 0
          ? 100
          : 0;

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      customer: order.user?.name || "N/A",
      email: order.user?.email || "",
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
      createdAt: order.createdAt,
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalProducts,
          totalOrders,
          thisMonthRevenue,
          lastMonthRevenue,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        },
        revenueChart,
        statusDistribution,
        topProducts: topProductsFormatted,
        recentOrders: formattedRecentOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};
