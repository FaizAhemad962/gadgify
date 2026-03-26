import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Paper, Typography, Box, Chip, Skeleton, Alert } from "@mui/material";
import {
  Inventory,
  ShoppingCart,
  People,
  CurrencyRupee,
  TrendingUp,
  TrendingDown,
  Warning,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { analyticsApi } from "../../api/analytics";
import { AppDataGrid } from "../../components/ui/AppDataGrid";
import type { GridColDef } from "@mui/x-data-grid";
import { formatDate } from "@/utils/dateFormatter";
import { tokens } from "@/theme/theme";

const STATUS_COLORS: Record<string, string> = {
  PENDING: tokens.warning,
  PROCESSING: tokens.primary,
  SHIPPED: tokens.info,
  DELIVERED: tokens.success,
  CANCELLED: tokens.error,
};

const PIE_COLORS = [
  tokens.warning,
  tokens.primary,
  tokens.info,
  tokens.success,
  tokens.error,
];

const AdminDashboard = () => {
  const { t } = useTranslation();

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: analyticsApi.getDashboard,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {t("common.error")}
      </Alert>
    );
  }

  const summary = analytics?.summary;

  const stats = [
    {
      title: t("admin.totalProducts"),
      value: summary?.totalProducts ?? 0,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: tokens.primary,
    },
    {
      title: t("admin.totalOrders"),
      value: summary?.totalOrders ?? 0,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: tokens.success,
    },
    {
      title: t("admin.totalUsers"),
      value: summary?.totalUsers ?? 0,
      icon: <People sx={{ fontSize: 40 }} />,
      color: tokens.secondary,
    },
    {
      title: t("admin.totalRevenue"),
      value: `₹${(summary?.thisMonthRevenue ?? 0).toLocaleString()}`,
      icon: <CurrencyRupee sx={{ fontSize: 40 }} />,
      color: tokens.accent,
      trend: summary?.revenueGrowth,
    },
  ];

  // DataGrid columns for recent orders
  const orderColumns: GridColDef[] = [
    {
      field: "id",
      headerName: t("admin.orderId"),
      minWidth: 120,
      maxWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <span style={{ color: tokens.primary, fontWeight: "600" }}>
          #{params.value?.substring(0, 8)}
        </span>
      ),
    },
    {
      field: "customer",
      headerName: t("admin.customer"),
      minWidth: 150,
      maxWidth: 200,
      flex: 1.2,
      renderCell: (params) => (
        <span style={{ color: tokens.gray500 }}>{params.value || "N/A"}</span>
      ),
    },
    {
      field: "total",
      headerName: t("admin.total"),
      minWidth: 100,
      maxWidth: 130,
      flex: 0.8,
      renderCell: (params) => (
        <span style={{ color: tokens.accent, fontWeight: "700" }}>
          ₹{params.value?.toLocaleString()}
        </span>
      ),
    },
    {
      field: "status",
      headerName: t("admin.status"),
      minWidth: 120,
      maxWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={t(`orders.${params.value?.toLowerCase()}`)}
          size="small"
          sx={{
            bgcolor: `${STATUS_COLORS[params.value] || tokens.gray500}18`,
            color: STATUS_COLORS[params.value] || tokens.gray500,
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: t("admin.date"),
      minWidth: 120,
      maxWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <span style={{ color: tokens.gray500 }}>
          {formatDate(params.value, t)}
        </span>
      ),
    },
  ];

  const chartPaper = {
    p: 3,
    bgcolor: tokens.white,
    border: `1px solid ${tokens.gray200}`,
    borderRadius: 3,
  };

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="700"
        sx={{ color: tokens.gray900, mb: 4 }}
      >
        {t("admin.dashboard")}
      </Typography>

      {/* Stat Cards */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
        {stats.map((stat, index) => (
          <Box
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" },
              minWidth: 200,
            }}
            key={index}
          >
            <Paper
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                bgcolor: tokens.white,
                border: `1px solid ${tokens.gray200}`,
                borderRadius: 3,
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 4,
                  height: "100%",
                  bgcolor: stat.color,
                  borderRadius: "4px 0 0 4px",
                },
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 24px ${stat.color}20`,
                  borderColor: stat.color,
                },
              }}
            >
              <Box
                sx={{
                  color: stat.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: `${stat.color}12`,
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                {stat.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                {isLoading ? (
                  <Skeleton width={80} height={32} />
                ) : (
                  <Typography
                    variant="h5"
                    fontWeight="700"
                    sx={{ color: tokens.gray900 }}
                  >
                    {stat.value}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: tokens.gray500 }}>
                  {stat.title}
                </Typography>
                {"trend" in stat && stat.trend !== undefined && !isLoading && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {stat.trend >= 0 ? (
                      <TrendingUp
                        sx={{ fontSize: 16, color: tokens.success }}
                      />
                    ) : (
                      <TrendingDown
                        sx={{ fontSize: 16, color: tokens.error }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: stat.trend >= 0 ? tokens.success : tokens.error,
                        fontWeight: 600,
                      }}
                    >
                      {stat.trend >= 0 ? "+" : ""}
                      {stat.trend}% {t("admin.vsLastMonth")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
        {/* Revenue Chart */}
        <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 65%" }, minWidth: 0 }}>
          <Paper sx={chartPaper}>
            <Typography
              variant="h6"
              fontWeight="700"
              sx={{ color: tokens.gray900, mb: 2 }}
            >
              {t("admin.revenueOverview")}
            </Typography>
            {isLoading ? (
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 2 }}
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics?.revenueChart || []}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={tokens.accent}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={tokens.accent}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={tokens.gray200}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })
                    }
                    stroke={tokens.gray400}
                    fontSize={12}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`
                    }
                    stroke={tokens.gray400}
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `₹${value.toLocaleString()}`,
                      t("admin.revenue"),
                    ]}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    }
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${tokens.gray200}`,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={tokens.accent}
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Box>

        {/* Order Status Distribution */}
        <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 30%" }, minWidth: 0 }}>
          <Paper sx={chartPaper}>
            <Typography
              variant="h6"
              fontWeight="700"
              sx={{ color: tokens.gray900, mb: 2 }}
            >
              {t("admin.orderDistribution")}
            </Typography>
            {isLoading ? (
              <Skeleton
                variant="circular"
                width={200}
                height={200}
                sx={{ mx: "auto" }}
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {(analytics?.statusDistribution || []).map(
                      (entry, index) => (
                        <Cell
                          key={entry.status}
                          fill={
                            STATUS_COLORS[entry.status] ||
                            PIE_COLORS[index % PIE_COLORS.length]
                          }
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value,
                      t(`orders.${name.toLowerCase()}`),
                    ]}
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${tokens.gray200}`,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Second Row: Top Products & Low Stock */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
        {/* Top Products */}
        <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 55%" }, minWidth: 0 }}>
          <Paper sx={chartPaper}>
            <Typography
              variant="h6"
              fontWeight="700"
              sx={{ color: tokens.gray900, mb: 2 }}
            >
              {t("admin.topProducts")}
            </Typography>
            {isLoading ? (
              <Skeleton
                variant="rectangular"
                height={250}
                sx={{ borderRadius: 2 }}
              />
            ) : analytics?.topProducts && analytics.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.topProducts} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={tokens.gray200}
                  />
                  <XAxis type="number" stroke={tokens.gray400} fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    stroke={tokens.gray400}
                    fontSize={12}
                    tickFormatter={(v) =>
                      v.length > 18 ? `${v.substring(0, 18)}…` : v
                    }
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === "unitsSold")
                        return [value, t("admin.unitsSold")];
                      return [`₹${value.toLocaleString()}`, t("admin.revenue")];
                    }}
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${tokens.gray200}`,
                    }}
                  />
                  <Bar
                    dataKey="unitsSold"
                    fill={tokens.primary}
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill={tokens.accent}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography
                color="text.secondary"
                sx={{ py: 4, textAlign: "center" }}
              >
                {t("admin.noData")}
              </Typography>
            )}
          </Paper>
        </Box>

        {/* Low Stock Alert */}
        <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 40%" }, minWidth: 0 }}>
          <Paper sx={chartPaper}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Warning sx={{ color: tokens.warning }} />
              <Typography
                variant="h6"
                fontWeight="700"
                sx={{ color: tokens.gray900 }}
              >
                {t("admin.lowStock")}
              </Typography>
            </Box>
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={40} sx={{ mb: 1 }} />
                ))}
              </>
            ) : analytics?.lowStockProducts &&
              analytics.lowStockProducts.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {analytics.lowStockProducts.map((product) => (
                  <Box
                    key={product.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor:
                        product.stock === 0
                          ? tokens.errorLight
                          : tokens.warningLight,
                      border: `1px solid ${product.stock === 0 ? tokens.error : tokens.warning}30`,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: tokens.gray900 }}
                      >
                        {product.name.length > 30
                          ? `${product.name.substring(0, 30)}…`
                          : product.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: tokens.gray500 }}
                      >
                        {product.category}
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        product.stock === 0
                          ? t("admin.outOfStock")
                          : `${product.stock} ${t("admin.left")}`
                      }
                      size="small"
                      color={product.stock === 0 ? "error" : "warning"}
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography
                color="text.secondary"
                sx={{ py: 4, textAlign: "center" }}
              >
                {t("admin.allStocked")}
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Recent Orders Table */}
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: tokens.gray900, fontWeight: "700", mb: 2.5 }}
        >
          {t("admin.recentOrders")}
        </Typography>
        <AppDataGrid
          rows={analytics?.recentOrders || []}
          columns={orderColumns}
          isLoading={isLoading}
          total={analytics?.recentOrders?.length || 0}
          page={0}
          rowsPerPage={10}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
