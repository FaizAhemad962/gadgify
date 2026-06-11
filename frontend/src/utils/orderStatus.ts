import type { TFunction } from "i18next";
import type { ChipProps } from "@/mui/material";
import { tokens } from "@/theme/theme";
import type { Order } from "@/types";

export type OrderStatus = Order["status"];
export type PaymentStatus = Order["paymentStatus"];

export const ORDER_STATUS_FLOW = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const satisfies readonly OrderStatus[];

export const ORDER_STATUS_OPTIONS = [
  ...ORDER_STATUS_FLOW,
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

export const getOrderStatusLabel = (status: OrderStatus | string, t: TFunction) => {
  const labels: Record<OrderStatus, string> = {
    PENDING: t("orders.pending"),
    PROCESSING: t("orders.processing"),
    SHIPPED: t("orders.shipped"),
    DELIVERED: t("orders.delivered"),
    CANCELLED: t("orders.cancelled"),
  };

  return labels[status as OrderStatus] || status;
};

export const getOrderStatusDescription = (
  status: OrderStatus | string,
  t: TFunction,
) => {
  const descriptions: Record<OrderStatus, string> = {
    PENDING: t(
      "orders.statusPendingDescription",
      "We are waiting for payment confirmation before preparing this order.",
    ),
    PROCESSING: t(
      "orders.statusProcessingDescription",
      "Your order is confirmed and being prepared for dispatch.",
    ),
    SHIPPED: t(
      "orders.statusShippedDescription",
      "Your order has been shipped and is on the way.",
    ),
    DELIVERED: t(
      "orders.statusDeliveredDescription",
      "Your order has been delivered successfully.",
    ),
    CANCELLED: t(
      "orders.statusCancelledDescription",
      "This order has been cancelled.",
    ),
  };

  return descriptions[status as OrderStatus] || "";
};

export const getOrderStatusChipColor = (
  status: OrderStatus | string,
): ChipProps["color"] => {
  const colors: Record<OrderStatus, ChipProps["color"]> = {
    PENDING: "warning",
    PROCESSING: "info",
    SHIPPED: "primary",
    DELIVERED: "success",
    CANCELLED: "error",
  };

  return colors[status as OrderStatus] || "default";
};

export const getOrderStatusAccent = (status: OrderStatus | string) => {
  const accents: Record<OrderStatus, string> = {
    PENDING: tokens.warning,
    PROCESSING: tokens.primary,
    SHIPPED: tokens.info,
    DELIVERED: tokens.success,
    CANCELLED: tokens.error,
  };

  return accents[status as OrderStatus] || tokens.gray400;
};

export const getPaymentStatusLabel = (
  status: PaymentStatus | string,
  t: TFunction,
) => {
  const labels: Record<PaymentStatus, string> = {
    PENDING: t("payment.pending"),
    COMPLETED: t("payment.completed"),
    FAILED: t("payment.failed"),
    CANCELLED: t("orders.cancelled"),
  };

  return labels[status as PaymentStatus] || status;
};

export const getPaymentStatusChipColor = (
  status: PaymentStatus | string,
): ChipProps["color"] => {
  const colors: Record<PaymentStatus, ChipProps["color"]> = {
    PENDING: "warning",
    COMPLETED: "success",
    FAILED: "error",
    CANCELLED: "error",
  };

  return colors[status as PaymentStatus] || "default";
};

export const getAllowedOrderStatusTransitions = (
  currentStatus: OrderStatus,
  paymentStatus: PaymentStatus,
): OrderStatus[] => {
  if (currentStatus === "CANCELLED" || currentStatus === "DELIVERED") {
    return [currentStatus];
  }

  if (paymentStatus !== "COMPLETED") {
    return currentStatus === "PENDING" ? ["PENDING", "CANCELLED"] : [currentStatus];
  }

  const transitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["PENDING", "PROCESSING", "CANCELLED"],
    PROCESSING: ["PROCESSING", "SHIPPED", "CANCELLED"],
    SHIPPED: ["SHIPPED", "DELIVERED"],
    DELIVERED: ["DELIVERED"],
    CANCELLED: ["CANCELLED"],
  };

  return transitions[currentStatus] || [currentStatus];
};
