import { apiClient } from "./client";

export interface AnalyticsSummary {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number;
}

export interface RevenueChartEntry {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface TopProduct {
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  paymentStatus: string;
  itemCount: number;
  createdAt: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  category: string;
}

export interface DashboardAnalytics {
  summary: AnalyticsSummary;
  revenueChart: RevenueChartEntry[];
  statusDistribution: StatusDistribution[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardAnalytics> => {
    const { data } = await apiClient.get("/admin/analytics");
    return data.data;
  },
};
