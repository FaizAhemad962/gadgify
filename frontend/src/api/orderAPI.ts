import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { invalidateOrderData } from "@/lib/queryInvalidation";
import { queryKeys } from "@/lib/queryKeys";

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentId?: string;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  couponCode?: string;
  shippingAddress: Record<string, unknown>;
  items: unknown[];
  createdAt: string;
  updatedAt: string;
}

export const useOrders = () => {
  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: async () => {
      const response = await apiClient.get("/orders", {
        withCredentials: true,
      });
      return response.data;
    },
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${orderId}`, {
        withCredentials: true,
      });
      return response.data;
    },
    enabled: !!orderId,
  });
};

// Auth cookies are sent by apiClient.
export const useCreatePaymentIntent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.post(
        `/orders/${orderId}/payment-intent`,
        {},
        {
          withCredentials: true,
        },
      );
      return response.data;
    },
    onSuccess: (_, orderId) => {
      invalidateOrderData(queryClient, orderId);
    },
  });
};

// Auth cookies are sent by apiClient.
export const useRetryPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.post(
        `/orders/${orderId}/retry-payment`,
        {},
        {
          withCredentials: true,
        },
      );
      return response.data;
    },
    onSuccess: (_, orderId) => {
      invalidateOrderData(queryClient, orderId);
    },
  });
};

// Auth cookies are sent by apiClient.
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.delete(`/orders/${orderId}/cancel`, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (_, orderId) => {
      invalidateOrderData(queryClient, orderId);
    },
  });
};

// Auth cookies are sent by apiClient.
export const useConfirmPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      orderId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      const response = await apiClient.post(
        `/orders/${data.orderId}/confirm-payment`,
        {
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
        },
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      invalidateOrderData(queryClient, variables.orderId);
    },
  });
};
