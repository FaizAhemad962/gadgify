import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import { ShoppingBag, Search, Replay } from "@mui/icons-material";
import { ordersApi } from "../api/orders";
import { useCart } from "../context/CartContext";
import { formatDate } from "../utils/dateFormatter";
import { tokens } from "@/theme/theme";

const ORDER_STATUSES = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.getAll,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<
      string,
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning"
    > = {
      PENDING: "warning",
      PROCESSING: "info",
      SHIPPED: "primary",
      DELIVERED: "success",
      CANCELLED: "error",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: t("orders.pending"),
      PROCESSING: t("orders.processing"),
      SHIPPED: t("orders.shipped"),
      DELIVERED: t("orders.delivered"),
      CANCELLED: t("orders.cancelled"),
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<
      string,
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning"
    > = {
      PENDING: "warning",
      COMPLETED: "success",
      FAILED: "error",
    };
    return colors[status] || "default";
  };

  const getPaymentStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: t("payment.pending"),
      COMPLETED: t("payment.completed"),
      FAILED: t("payment.failed"),
    };
    return statusMap[status] || status;
  };

  // Reorder: add all items from an order back to cart
  const handleReorder = async (order: any) => {
    for (const item of order.items) {
      await addToCart({ productId: item.productId, quantity: item.quantity });
    }
    navigate("/cart");
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let result = orders;
    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((item) => item.product.name.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  if (isLoading) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{t("errors.somethingWrong")}</Alert>
      </Container>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <ShoppingBag sx={{ fontSize: 100, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          {t("admin.noOrders")}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/products")}
          sx={{ mt: 2 }}
        >
          {t("common.shopNow")}
        </Button>
      </Container>
    );
  }

  return (
    <Box maxWidth="xxl">
      <Typography variant="h4" gutterBottom fontWeight="600">
        {t("orders.title")}
      </Typography>

      {/* Search Bar */}
      <TextField
        size="small"
        placeholder={t("common.searchOrders")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        sx={{
          mb: 2,
          maxWidth: 400,
          "& .MuiOutlinedInput-root": { borderRadius: 2 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: tokens.gray400 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Status Filter Chips */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
        {ORDER_STATUSES.map((status) => (
          <Chip
            key={status}
            label={status === "ALL" ? t("common.all") : getStatusLabel(status)}
            onClick={() => setStatusFilter(status)}
            variant={statusFilter === status ? "filled" : "outlined"}
            color={
              statusFilter === status
                ? status === "ALL"
                  ? "primary"
                  : getStatusColor(status)
                : "default"
            }
            sx={{ fontWeight: 600, cursor: "pointer" }}
          />
        ))}
      </Box>

      {filteredOrders.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            {t("common.noOrdersFound")}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              sx={{
                borderTop: "4px solid #1976d2",
                "&:hover": { boxShadow: "0 8px 16px rgba(0,0,0,0.1)" },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {t("orders.orderNumber")}
                        {order.id.slice(0, 8)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("orders.date")}: {formatDate(order.createdAt, t)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { sm: "right" } }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        ₹{order.total.toLocaleString()}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: { sm: "flex-end" },
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={`${t("orders.status")}: ${getStatusLabel(order.status)}`}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ fontWeight: 600, minWidth: 140 }}
                        />
                        {order.paymentStatus && (
                          <Chip
                            label={`${t("payment.label")}: ${getPaymentStatusLabel(order.paymentStatus)}`}
                            color={getPaymentStatusColor(order.paymentStatus)}
                            size="small"
                            sx={{ fontWeight: 600, minWidth: 140 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t("orders.items")}: {order.items.length}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {order.items.slice(0, 2).map((item) => (
                        <Typography
                          key={item.id}
                          variant="body2"
                          sx={{ ml: 1 }}
                        >
                          {item.product.name} × {item.quantity}
                        </Typography>
                      ))}
                      {order.items.length > 2 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          + {order.items.length - 2} {t("orders.moreItems")}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      {t("orders.viewDetails")}
                    </Button>
                    {order.status === "DELIVERED" && (
                      <Button
                        variant="text"
                        startIcon={<Replay />}
                        onClick={() => handleReorder(order)}
                        sx={{
                          ml: 1,
                          fontWeight: 600,
                          color: tokens.accent,
                          textTransform: "none",
                        }}
                      >
                        {t("common.reorder")}
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default OrdersPage;
