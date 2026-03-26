import { useTranslation } from "react-i18next";
import { Box, Typography, useTheme } from "@mui/material";
import {
  CheckCircle,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Cancel,
  ShoppingCart,
  Settings,
  LocalShipping,
  Inventory,
} from "@mui/icons-material";

interface OrderTimelineProps {
  status: string;
  createdAt: string;
}

const STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

const OrderTimeline = ({ status, createdAt }: OrderTimelineProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const isCancelled = status === "CANCELLED";
  const currentIndex = STEPS.indexOf(status as (typeof STEPS)[number]);

  const stepConfig: Record<
    string,
    { label: string; icon: typeof ShoppingCart }
  > = {
    PENDING: { label: t("common.orderPlaced"), icon: ShoppingCart },
    PROCESSING: { label: t("common.orderProcessing"), icon: Settings },
    SHIPPED: { label: t("common.orderShipped"), icon: LocalShipping },
    DELIVERED: { label: t("common.orderDelivered"), icon: Inventory },
  };

  const getStepState = (index: number) => {
    if (isCancelled) return index === 0 ? "completed" : "cancelled";
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  };

  const getColor = (state: string) => {
    switch (state) {
      case "completed":
        return theme.palette.success.main;
      case "current":
        return theme.palette.primary.main;
      case "cancelled":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[400];
    }
  };

  const getIcon = (_index: number, state: string) => {
    const color = getColor(state);

    if (state === "cancelled") {
      return <Cancel sx={{ fontSize: 28, color }} />;
    }
    if (state === "completed") {
      return <CheckCircle sx={{ fontSize: 28, color }} />;
    }
    if (state === "current") {
      return <RadioButtonChecked sx={{ fontSize: 28, color }} />;
    }
    return <RadioButtonUnchecked sx={{ fontSize: 28, color }} />;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t("common.orderTimeline")}
      </Typography>

      {isCancelled && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Cancel sx={{ color: "error.main", fontSize: 20 }} />
          <Typography variant="body2" color="error.main" fontWeight={600}>
            {t("common.orderCancelled")}
          </Typography>
        </Box>
      )}

      <Box sx={{ position: "relative", pl: 2 }}>
        {STEPS.map((step, index) => {
          const state = getStepState(index);
          const config = stepConfig[step];
          const isLast = index === STEPS.length - 1;

          return (
            <Box
              key={step}
              sx={{ display: "flex", position: "relative", pb: isLast ? 0 : 4 }}
            >
              {/* Connector line */}
              {!isLast && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 13,
                    top: 28,
                    bottom: 0,
                    width: 2,
                    bgcolor:
                      state === "completed" ||
                      (state === "current" && !isCancelled)
                        ? "success.main"
                        : isCancelled
                          ? "error.light"
                          : "grey.300",
                  }}
                />
              )}

              {/* Icon */}
              <Box sx={{ position: "relative", zIndex: 1, mr: 2 }}>
                {getIcon(index, state)}
              </Box>

              {/* Label */}
              <Box sx={{ pt: 0.3 }}>
                <Typography
                  variant="body1"
                  fontWeight={state === "current" ? 700 : 500}
                  color={
                    state === "upcoming" ? "text.disabled" : "text.primary"
                  }
                >
                  {config.label}
                </Typography>
                {state === "current" && step === "PENDING" && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                )}
                {state === "completed" && step === "PENDING" && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default OrderTimeline;
