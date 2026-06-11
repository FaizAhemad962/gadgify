import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@/mui/material";
import {
  ArrowForward,
  CalendarMonth,
  Inventory2,
  ReceiptLong,
  Replay,
  Search,
  ShoppingBag,
} from "@/mui/icons";
import { ordersApi } from "../api/orders";
import { useCart } from "../context/CartContext";
import { formatDate } from "../utils/dateFormatter";
import { tokens } from "@/theme/theme";
import { appIconSx } from "@/components/ui/navigationStyles";
import type { Order } from "@/types";
import {
  ORDER_STATUS_OPTIONS,
  getOrderStatusAccent,
  getOrderStatusChipColor,
  getOrderStatusLabel,
  getPaymentStatusChipColor,
  getPaymentStatusLabel,
} from "@/utils/orderStatus";

const ORDER_STATUSES = ["ALL", ...ORDER_STATUS_OPTIONS] as const;

type OrderStatusFilter = (typeof ORDER_STATUSES)[number];

const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.getAll,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  });

  const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  const handleReorder = async (order: Order) => {
    for (const item of order.items) {
      await addToCart({ productId: item.productId, quantity: item.quantity });
    }
    navigate("/cart");
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let result = orders;

    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(q) ||
          order.items.some((item) =>
            item.product.name.toLowerCase().includes(q),
          ),
      );
    }

    return result;
  }, [orders, statusFilter, searchQuery]);

  const summary = useMemo(() => {
    const allOrders = orders || [];
    return {
      total: allOrders.length,
      active: allOrders.filter(
        (order) => !["DELIVERED", "CANCELLED"].includes(order.status),
      ).length,
      delivered: allOrders.filter((order) => order.status === "DELIVERED")
        .length,
      totalSpent: allOrders.reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders]);

  if (error) {
    return (
      <Container
        maxWidth={false}
        sx={{ maxWidth: tokens.appMaxWidth, py: 5, px: tokens.pagePaddingX }}
      >
        <Alert severity="error">{t("errors.somethingWrong")}</Alert>
      </Container>
    );
  }

  const renderEmptyState = (isFiltered: boolean) => (
    <Paper
      elevation={0}
      sx={{
        py: { xs: 6, md: 8 },
        px: 3,
        textAlign: "center",
        borderRadius: `${tokens.radiusXl}px`,
        border: `1px solid ${tokens.gray200}`,
        background:
          "linear-gradient(135deg, rgba(27,42,74,0.04), rgba(255,107,44,0.06))",
      }}
    >
      <Box
        sx={{
          width: 86,
          height: 86,
          mx: "auto",
          mb: 2,
          borderRadius: "28px",
          display: "grid",
          placeItems: "center",
          color: tokens.accent,
          bgcolor: `${tokens.accent}14`,
        }}
      >
        <ShoppingBag sx={appIconSx.feature} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 900, color: tokens.gray900 }}>
        {isFiltered ? t("common.noOrdersFound") : t("admin.noOrders")}
      </Typography>
      <Typography sx={{ mt: 1, color: tokens.gray600 }}>
        {isFiltered
          ? t("orders.adjustFilters", "Try changing your search or filters.")
          : t("orders.emptyMessage", "Your orders will appear here after checkout.")}
      </Typography>
      {!isFiltered && (
        <Button
          variant="contained"
          endIcon={<ArrowForward sx={appIconSx.lg} />}
          onClick={() => navigate("/products")}
          sx={{
            mt: 3,
            px: 3,
            borderRadius: "999px",
            bgcolor: tokens.accent,
            fontWeight: 800,
            "&:hover": { bgcolor: tokens.accentDark },
          }}
        >
          {t("common.shopNow")}
        </Button>
      )}
    </Paper>
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: tokens.appMaxWidth,
        px: tokens.pagePaddingX,
        py: { xs: 3, md: 5 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: `${tokens.radiusXl}px`,
          border: `1px solid ${tokens.gray200}`,
          background:
            "linear-gradient(135deg, rgba(27,42,74,0.06), rgba(255,107,44,0.08))",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          gap={2}
        >
          <Box>
            <Chip
              icon={<ReceiptLong sx={appIconSx.sm} />}
              label={t("orders.title")}
              sx={{
                mb: 1.5,
                bgcolor: tokens.white,
                color: tokens.primary,
                fontWeight: 800,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: tokens.gray900,
                letterSpacing: "-0.04em",
              }}
            >
              {t("orders.title")}
            </Typography>
            <Typography sx={{ mt: 0.75, color: tokens.gray600 }}>
              {t(
                "orders.subtitle",
                "Track purchases, payment status, and reorder delivered items.",
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate("/products")}
            endIcon={<ArrowForward sx={appIconSx.lg} />}
            sx={{
              borderRadius: "999px",
              px: 2.5,
              fontWeight: 800,
              color: tokens.primary,
              borderColor: tokens.primary,
              bgcolor: tokens.white,
            }}
          >
            {t("common.shopNow")}
          </Button>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: 1.5,
            mt: 3,
          }}
        >
          {[
            {
              label: t("orders.total", "Total"),
              value: summary.total,
              icon: <ReceiptLong sx={appIconSx.lg} />,
            },
            {
              label: t("orders.activeOrders", "Active"),
              value: summary.active,
              icon: <Inventory2 sx={appIconSx.lg} />,
            },
            {
              label: t("orders.delivered"),
              value: summary.delivered,
              icon: <ShoppingBag sx={appIconSx.lg} />,
            },
            {
              label: t("orders.totalSpent", "Total spent"),
              value: formatCurrency(summary.totalSpent),
              icon: <ReceiptLong sx={appIconSx.lg} />,
            },
          ].map((item) => (
            <Paper
              key={item.label}
              elevation={0}
              sx={{
                p: 1.75,
                borderRadius: `${tokens.radiusLg}px`,
                border: `1px solid ${tokens.gray200}`,
                bgcolor: "rgba(255,255,255,0.78)",
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    color: tokens.accent,
                    bgcolor: `${tokens.accent}14`,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900, color: tokens.gray900 }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.gray500 }}>
                    {item.label}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: `${tokens.radiusXl}px`,
          border: `1px solid ${tokens.gray200}`,
          bgcolor: tokens.white,
        }}
      >
        <Stack spacing={2}>
          <TextField
            size="small"
            placeholder={t("common.searchOrders")}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ ...appIconSx.lg, color: tokens.gray400 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { md: 440 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "999px",
                bgcolor: tokens.gray50,
              },
            }}
          />

          <Stack direction="row" gap={1} flexWrap="wrap">
            {ORDER_STATUSES.map((status) => {
              const isSelected = statusFilter === status;

              return (
                <Chip
                  key={status}
                  label={
                    status === "ALL"
                      ? t("common.all")
                      : getOrderStatusLabel(status, t)
                  }
                  onClick={() => setStatusFilter(status)}
                  variant={isSelected ? "filled" : "outlined"}
                  color={
                    isSelected
                      ? status === "ALL"
                        ? "primary"
                        : getOrderStatusChipColor(status)
                      : "default"
                  }
                  sx={{
                    fontWeight: 800,
                    cursor: "pointer",
                    borderRadius: "999px",
                    px: 0.5,
                  }}
                />
              );
            })}
          </Stack>
        </Stack>
      </Paper>

      {isLoading ? (
        <Stack spacing={2}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={190}
              sx={{ borderRadius: `${tokens.radiusXl}px` }}
            />
          ))}
        </Stack>
      ) : !orders || orders.length === 0 ? (
        renderEmptyState(false)
      ) : filteredOrders.length === 0 ? (
        renderEmptyState(true)
      ) : (
        <Stack spacing={2.5}>
          {filteredOrders.map((order) => {
            const previewItems = order.items.slice(0, 3);
            const hiddenItemCount = Math.max(order.items.length - 3, 0);

            return (
              <Card
                key={order.id}
                elevation={0}
                sx={{
                  borderRadius: `${tokens.radiusXl}px`,
                  border: `1px solid ${tokens.gray200}`,
                  borderLeft: `5px solid ${getOrderStatusAccent(order.status)}`,
                  overflow: "hidden",
                  transition:
                    "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: tokens.shadowLg,
                    borderColor: `${getOrderStatusAccent(order.status)}66`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 2.75 } }}>
                  <Stack spacing={2.25}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      gap={2}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: tokens.gray900,
                            wordBreak: "break-word",
                          }}
                        >
                          {t("orders.orderNumber")}
                          {order.id.slice(0, 8).toUpperCase()}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mt: 0.5, color: tokens.gray500 }}
                        >
                          <CalendarMonth sx={appIconSx.sm} />
                          <Typography variant="body2">
                            {formatDate(order.createdAt, t)}
                          </Typography>
                        </Stack>
                      </Box>

                      <Stack
                        alignItems={{ xs: "flex-start", md: "flex-end" }}
                        spacing={1}
                      >
                        <Typography
                          variant="h5"
                          sx={{ color: tokens.accent, fontWeight: 900 }}
                        >
                          {formatCurrency(order.total)}
                        </Typography>
                        <Stack direction="row" gap={1} flexWrap="wrap">
                          <Chip
                            label={getOrderStatusLabel(order.status, t)}
                            color={getOrderStatusChipColor(order.status)}
                            size="small"
                            sx={{ fontWeight: 800 }}
                          />
                          {order.paymentStatus && (
                            <Chip
                              label={`${t("payment.label")}: ${getPaymentStatusLabel(order.paymentStatus, t)}`}
                              color={getPaymentStatusChipColor(order.paymentStatus)}
                              size="small"
                              sx={{ fontWeight: 800 }}
                            />
                          )}
                        </Stack>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack spacing={1.25}>
                      <Typography
                        variant="body2"
                        sx={{ color: tokens.gray600, fontWeight: 800 }}
                      >
                        {t("orders.items")}: {order.items.length}
                      </Typography>
                      <Stack spacing={1}>
                        {previewItems.map((item) => {
                          const image =
                            item.product.media?.find((media) => media.isPrimary)
                              ?.url || item.product.media?.[0]?.url;

                          return (
                            <Stack
                              key={item.id}
                              direction="row"
                              spacing={1.25}
                              alignItems="center"
                              sx={{
                                p: 1,
                                borderRadius: `${tokens.radiusMd}px`,
                                bgcolor: tokens.gray50,
                              }}
                            >
                              <Avatar
                                src={image}
                                variant="rounded"
                                sx={{
                                  width: 46,
                                  height: 46,
                                  bgcolor: tokens.white,
                                  border: `1px solid ${tokens.gray200}`,
                                }}
                              >
                                <ShoppingBag sx={appIconSx.lg} />
                              </Avatar>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  noWrap
                                  sx={{
                                    fontWeight: 800,
                                    color: tokens.gray900,
                                  }}
                                >
                                  {item.product.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: tokens.gray500 }}
                                >
                                  {formatCurrency(item.price)} x {item.quantity}
                                </Typography>
                              </Box>
                            </Stack>
                          );
                        })}
                      </Stack>
                      {hiddenItemCount > 0 && (
                        <Typography variant="body2" sx={{ color: tokens.gray500 }}>
                          + {hiddenItemCount} {t("orders.moreItems")}
                        </Typography>
                      )}
                    </Stack>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      gap={1.25}
                    >
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        endIcon={<ArrowForward sx={appIconSx.lg} />}
                        sx={{
                          borderRadius: "999px",
                          bgcolor: tokens.primary,
                          fontWeight: 800,
                          px: 2.5,
                          "&:hover": { bgcolor: tokens.primaryDark },
                        }}
                      >
                        {t("orders.viewDetails")}
                      </Button>
                      {order.status === "DELIVERED" && (
                        <Button
                          variant="outlined"
                          startIcon={<Replay sx={appIconSx.lg} />}
                          onClick={() => void handleReorder(order)}
                          sx={{
                            borderRadius: "999px",
                            fontWeight: 800,
                            color: tokens.accent,
                            borderColor: tokens.accent,
                            px: 2.5,
                            "&:hover": {
                              borderColor: tokens.accentDark,
                              bgcolor: `${tokens.accent}12`,
                            },
                          }}
                        >
                          {t("common.reorder")}
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
};

export default OrdersPage;
