import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Alert, Box, Paper, TextField, InputAdornment } from "@/mui/material";
import { Search } from "@/mui/icons";
import { ordersApi } from "../../api/orders";
import { AdminOrdersDataGrid } from "../../components/admin/AdminOrdersDataGrid";
import type { Order } from "../../types";
import { useState } from "react";
import { tokens } from "../../theme/theme";
import { invalidateOrderData } from "@/lib/queryInvalidation";
import { queryKeys } from "@/lib/queryKeys";
import { AdminPageHeader } from "@/components/admin/adminStyles";
import {
  adminPageSx,
  adminPanelSx,
  adminSearchFieldSx,
} from "@/components/admin/adminStyleTokens";
import { appIconSx } from "@/components/ui/navigationStyles";
import { ErrorHandler } from "@/utils/errorHandler";

const AdminOrders = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusError, setStatusError] = useState("");

  const { data: ordersData, isLoading } = useQuery({
    queryKey: [...queryKeys.orders.admin, page, rowsPerPage, searchQuery],
    queryFn: () => ordersApi.getAllOrders(page + 1, rowsPerPage, searchQuery),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: Order["status"];
    }) => ordersApi.updateOrderStatus(orderId, status),
    onSuccess: (updatedOrder, variables) => {
      queryClient.setQueriesData<{ orders: Order[]; total: number }>(
        { queryKey: queryKeys.orders.admin },
        (current) =>
          current
            ? {
                ...current,
                orders: current.orders.map((order) =>
                  order.id === variables.orderId ? updatedOrder : order,
                ),
              }
            : current,
      );
      queryClient.setQueryData(queryKeys.orders.detail(variables.orderId), updatedOrder);
      setStatusError("");
      invalidateOrderData(queryClient, variables.orderId);
    },
    onError: (error) => {
      setStatusError(
        ErrorHandler.getUserFriendlyMessage(
          error,
          t("errors.somethingWrong"),
        ),
      );
    },
  });

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setRowsPerPage(rowsPerPage);
    setPage(0);
  };

  return (
    <Box sx={adminPageSx}>
      <AdminPageHeader
        title={t("admin.orders")}
        subtitle={t(
          "admin.ordersSubtitle",
          "Search customer orders and update fulfillment status.",
        )}
        eyebrow={t("nav.admin")}
        icon={<Search sx={appIconSx.card} />}
      />

      {statusError && (
        <Alert severity="error" onClose={() => setStatusError("")} sx={{ mb: 2 }}>
          {statusError}
        </Alert>
      )}

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          ...adminPanelSx,
          p: 2,
          mb: 3,
        }}
      >
        <TextField
          placeholder={t("admin.searchOrders")}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0); // Reset to first page on search
          }}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search sx={{ ...appIconSx.lg, color: tokens.gray400 }} />
              </InputAdornment>
            ),
          }}
          sx={adminSearchFieldSx}
        />
      </Paper>

      <AdminOrdersDataGrid
        orders={ordersData?.orders || []}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        total={ordersData?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  );
};

export default AdminOrders;
