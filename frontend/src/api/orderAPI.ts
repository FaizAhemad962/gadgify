import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { getCsrfToken } from "./csrfHelper";

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
  shippingAddress: any;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
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
    queryKey: ["orders", orderId],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${orderId}`, {
        withCredentials: true,
      });
      return response.data;
    },
    enabled: !!orderId,
  });
};

export const useCreatePaymentIntent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const csrfToken = await getCsrfToken();
      const response = await apiClient.post(
        `/orders/${orderId}/payment-intent`,
        {},
        {
          withCredentials: true,
          headers: {
            "x-csrf-token": csrfToken,
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useRetryPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const csrfToken = await getCsrfToken();
      const response = await apiClient.post(
        `/orders/${orderId}/retry-payment`,
        {},
        {
          withCredentials: true,
          headers: {
            "x-csrf-token": csrfToken,
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const csrfToken = await getCsrfToken();
      const response = await apiClient.delete(`/orders/${orderId}/cancel`, {
        withCredentials: true,
        headers: {
          "x-csrf-token": csrfToken,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      orderId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      // ✅ SECURITY: apiClient handles httpOnly cookies automatically
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
