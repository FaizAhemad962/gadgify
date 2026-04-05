import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Badge,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface OrderCardProps {
  orderId: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  onRetryPayment?: () => void;
}

export const PendingOrderCard: React.FC<OrderCardProps> = ({
  orderId,
  status,
  paymentStatus,
  total,
  createdAt,
  onRetryPayment,
}) => {
  const { t } = useTranslation();
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const queryClient = useQueryClient();
  const retryPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/orders/${orderId}/retry-payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to retry payment");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Open Razorpay payment gateway
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayWindow = window as any;
      if (RazorpayWindow.Razorpay) {
        const razorpay = new RazorpayWindow.Razorpay({
          key_id: data.data.keyId,
          order_id: data.data.razorpayOrderId,
          amount: data.data.amount,
          currency: "INR",
          name: "Gadgify",
          description: `Payment for Order ${orderId}`,
          handler: async () => {
            // Handle payment success in parent component
            onRetryPayment?.();
            queryClient.invalidateQueries({ queryKey: ["orders"] });
          },
          theme: { color: "#1976d2" },
        });
        razorpay.open();
      }
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel order");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setOpenConfirm(false);
    },
  });

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const handleCancelClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmCancel = () => {
    cancelOrderMutation.mutate();
  };

  return (
    <>
      <Card
        sx={{
          mb: 2,
          border: paymentStatus === "PENDING" ? "2px solid #ff6b6b" : "none",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                {t("Order ID")}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {orderId.slice(0, 8)}...
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                {t("Total")}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                ₹{total.toFixed(2)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                {t("Status")}
              </Typography>
              <Chip label={status} size="small" variant="outlined" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                {t("Payment Status")}
              </Typography>
              <Badge
                badgeContent={
                  paymentStatus === "PENDING" ? (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "error.main",
                      }}
                    />
                  ) : null
                }
              >
                <Chip
                  label={paymentStatus}
                  size="small"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  color={getPaymentStatusColor(paymentStatus) as any}
                  variant="outlined"
                />
              </Badge>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Typography variant="caption" color="textSecondary">
                {t("Created")}: {new Date(createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          {paymentStatus === "PENDING" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t("Payment pending")} -{" "}
              {t("You can retry payment or cancel this order")}
            </Alert>
          )}

          {retryPaymentMutation.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {retryPaymentMutation.error instanceof Error
                ? retryPaymentMutation.error.message
                : t("Error retrying payment")}
            </Alert>
          )}

          {cancelOrderMutation.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {cancelOrderMutation.error instanceof Error
                ? cancelOrderMutation.error.message
                : t("Error cancelling order")}
            </Alert>
          )}
        </CardContent>

        {paymentStatus === "PENDING" && (
          <CardActions sx={{ justifyContent: "flex-end", gap: 1 }}>
            <Button
              startIcon={
                retryPaymentMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <RefreshIcon />
                )
              }
              variant="contained"
              color="primary"
              onClick={() => retryPaymentMutation.mutate()}
              disabled={
                retryPaymentMutation.isPending || cancelOrderMutation.isPending
              }
            >
              {t("Retry Payment")}
            </Button>
            <Button
              startIcon={
                cancelOrderMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : (
                  <DeleteIcon />
                )
              }
              variant="outlined"
              color="error"
              onClick={handleCancelClick}
              disabled={
                retryPaymentMutation.isPending || cancelOrderMutation.isPending
              }
            >
              {t("Cancel Order")}
            </Button>
          </CardActions>
        )}
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("Cancel Order")}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            {t("Are you sure you want to cancel this order")}?
          </Alert>
          <Typography variant="body2" sx={{ mt: 2, color: "textSecondary" }}>
            {t("Once cancelled, this action cannot be undone")}.{" "}
            {t("You can create a new order for the same items")}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenConfirm(false)}
            disabled={cancelOrderMutation.isPending}
          >
            {t("Keep Order")}
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={cancelOrderMutation.isPending}
          >
            {cancelOrderMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              t("Confirm Cancel")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PendingOrderCard;
