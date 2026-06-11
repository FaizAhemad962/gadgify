import { useTranslation } from "react-i18next";
import { Box, Paper, Typography } from "@/mui/material";
import {
  CheckCircle,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Cancel,
  ShoppingCart,
  Settings,
  LocalShipping,
  Inventory,
} from "@/mui/icons";
import { appIconSx } from "@/components/ui/navigationStyles";
import {
  ORDER_STATUS_FLOW,
  getOrderStatusAccent,
  getOrderStatusDescription,
  getOrderStatusLabel,
  type OrderStatus,
} from "@/utils/orderStatus";
import { formatDate } from "@/utils/dateFormatter";

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
}

type TimelineStep = (typeof ORDER_STATUS_FLOW)[number];

const stepIcons: Record<TimelineStep, typeof ShoppingCart> = {
  PENDING: ShoppingCart,
  PROCESSING: Settings,
  SHIPPED: LocalShipping,
  DELIVERED: Inventory,
};

const OrderTimeline = ({ status, createdAt }: OrderTimelineProps) => {
  const { t } = useTranslation();
  const isCancelled = status === "CANCELLED";
  const currentIndex = isCancelled
    ? -1
    : ORDER_STATUS_FLOW.indexOf(status as TimelineStep);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  const getStepState = (index: number) => {
    if (isCancelled) return index === 0 ? "completed" : "cancelled";
    if (index < activeIndex) return "completed";
    if (index === activeIndex && status === "DELIVERED") return "completed";
    if (index === activeIndex) return "current";
    return "upcoming";
  };

  const getIcon = (step: TimelineStep, state: string) => {
    const color =
      state === "completed"
        ? getOrderStatusAccent("DELIVERED")
        : state === "current"
          ? getOrderStatusAccent(step)
          : state === "cancelled"
            ? getOrderStatusAccent("CANCELLED")
            : "text.disabled";

    if (state === "cancelled") {
      return <Cancel sx={{ ...appIconSx.section, color }} />;
    }

    if (state === "completed") {
      return <CheckCircle sx={{ ...appIconSx.section, color }} />;
    }

    if (state === "current") {
      return <RadioButtonChecked sx={{ ...appIconSx.section, color }} />;
    }

    return <RadioButtonUnchecked sx={{ ...appIconSx.section, color }} />;
  };

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          {t("common.orderTimeline")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isCancelled
            ? getOrderStatusDescription("CANCELLED", t)
            : getOrderStatusDescription(status, t)}
        </Typography>
      </Box>

      {isCancelled && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 3,
            bgcolor: `${getOrderStatusAccent("CANCELLED")}12`,
            border: `1px solid ${getOrderStatusAccent("CANCELLED")}33`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Cancel sx={{ ...appIconSx.lg, color: getOrderStatusAccent("CANCELLED") }} />
            <Typography fontWeight={800} color={getOrderStatusAccent("CANCELLED")}>
              {t("common.orderCancelled")}
            </Typography>
          </Box>
        </Paper>
      )}

      <Box sx={{ position: "relative" }}>
        {ORDER_STATUS_FLOW.map((step, index) => {
          const state = getStepState(index);
          const StepIcon = stepIcons[step];
          const isLast = index === ORDER_STATUS_FLOW.length - 1;
          const isCurrent = state === "current";
          const isCompleted = state === "completed";
          const color = isCurrent
            ? getOrderStatusAccent(step)
            : isCompleted
              ? getOrderStatusAccent("DELIVERED")
              : state === "cancelled"
                ? getOrderStatusAccent("CANCELLED")
                : "text.disabled";

          return (
            <Box
              key={step}
              sx={{
                display: "grid",
                gridTemplateColumns: "32px 1fr",
                columnGap: 1.5,
                position: "relative",
                pb: isLast ? 0 : 3,
              }}
            >
              {!isLast && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 15,
                    top: 34,
                    bottom: 0,
                    width: 2,
                    borderRadius: 99,
                    bgcolor:
                      isCompleted && !isCancelled
                        ? `${getOrderStatusAccent("DELIVERED")}66`
                        : isCancelled
                          ? `${getOrderStatusAccent("CANCELLED")}33`
                          : "grey.200",
                  }}
                />
              )}

              <Box sx={{ position: "relative", zIndex: 1 }}>
                {getIcon(step, state)}
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: isCurrent ? `${getOrderStatusAccent(step)}10` : "transparent",
                  border: isCurrent
                    ? `1px solid ${getOrderStatusAccent(step)}33`
                    : "1px solid transparent",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StepIcon sx={{ ...appIconSx.sm, color }} />
                  <Typography
                    fontWeight={isCurrent || isCompleted ? 800 : 600}
                    color={state === "upcoming" ? "text.disabled" : "text.primary"}
                  >
                    {getOrderStatusLabel(step, t)}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color={state === "upcoming" ? "text.disabled" : "text.secondary"}
                  sx={{ mt: 0.75 }}
                >
                  {getOrderStatusDescription(step, t)}
                </Typography>

                {step === "PENDING" && (isCurrent || isCompleted) && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    {formatDate(createdAt, t)}
                  </Typography>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default OrderTimeline;
