import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Paper, Typography, Box } from "@mui/material";
import {
  Inventory,
  ShoppingCart,
  People,
  CurrencyRupee,
} from "@mui/icons-material";
import { productsApi } from "../../api/products";
import { ordersApi } from "../../api/orders";
import { AppDataGrid } from "../../components/ui/AppDataGrid";
import type { GridColDef } from "@mui/x-data-grid";
import { formatDate } from "@/utils/dateFormatter";
import { tokens } from "@/theme/theme";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.getAll,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["admin-orders-dashboard"],
    queryFn: () => ordersApi.getAllOrders(1, 50), // Get more orders for dashboard
  });

  const orders = ordersData?.orders || [];

  const stats = [
    {
      title: t("admin.totalProducts"),
      value: products?.length || 0,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: tokens.primary,
    },
    {
      title: t("admin.totalOrders"),
      value: orders.length,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: tokens.success,
    },
    {
      title: t("admin.pendingOrders"),
      value: orders.filter((o) => o.status === "PENDING").length,
      icon: <People sx={{ fontSize: 40 }} />,
      color: tokens.warning,
    },
    {
      title: t("admin.totalRevenue"),
      value: `₹${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}`,
      icon: <CurrencyRupee sx={{ fontSize: 40 }} />,
      color: tokens.secondary,
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
      field: "user",
      headerName: t("admin.customer"),
      minWidth: 150,
      maxWidth: 200,
      flex: 1.2,
      renderCell: (params) => (
        <span style={{ color: tokens.gray500 }}>
          {params.row.user?.name || "N/A"}
        </span>
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
      renderCell: (params) => {
        const statusColors = {
          PENDING: tokens.warning,
          PROCESSING: tokens.primary,
          SHIPPED: tokens.success,
          DELIVERED: tokens.secondary,
          CANCELLED: tokens.error,
        };
        return (
          <span
            style={{
              color:
                statusColors[params.value as keyof typeof statusColors] ||
                tokens.gray500,
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {t(`orders.${params.value?.toLowerCase()}`)}
          </span>
        );
      },
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
              <Box>
                <Typography
                  variant="h5"
                  fontWeight="700"
                  sx={{ color: tokens.gray900 }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: tokens.gray500 }}>
                  {stat.title}
                </Typography>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: tokens.gray900, fontWeight: "700", mb: 2.5 }}
        >
          {t("admin.recentOrders")}
        </Typography>
        <AppDataGrid
          rows={orders.slice(0, 10)} // Show last 10 orders
          columns={orderColumns}
          isLoading={false}
          total={orders.length}
          page={0}
          rowsPerPage={10}
          onPageChange={() => {}} // Dashboard doesn't need pagination
          onRowsPerPageChange={() => {}}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
