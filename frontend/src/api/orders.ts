import { apiClient } from "./client";
import type { Order, CreateOrderRequest, PaymentIntent } from "../types";

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>("/orders", {
      withCredentials: true,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  create: async (data: CreateOrderRequest): Promise<Order> => {
    // Auth cookies are sent by apiClient.
    const response = await apiClient.post<Order>("/orders", data, {
      withCredentials: true,
    });
    return response.data;
  },

  createPaymentIntent: async (orderId: string): Promise<PaymentIntent> => {
    // Auth cookies are sent by apiClient.
    const response = await apiClient.post<PaymentIntent>(
      `/orders/${orderId}/payment-intent`,
      {},
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  confirmPayment: async (
    orderId: string,
    paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ): Promise<Order> => {
    // Auth cookies are sent by apiClient.
    const response = await apiClient.post<Order>(
      `/orders/${orderId}/confirm-payment`,
      paymentData,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  retryPayment: async (orderId: string): Promise<PaymentIntent> => {
    // Auth cookies are sent by apiClient.
    const response = await apiClient.post<PaymentIntent>(
      `/orders/${orderId}/retry-payment`,
      {},
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  // Admin APIs
  getAllOrders: async (
    page = 1,
    limit = 20,
    search = "",
  ): Promise<{ orders: Order[]; total: number }> => {
    const response = await apiClient.get<{ orders: Order[]; total: number }>(
      "/admin/orders",
      {
        params: {
          page,
          limit,
          search,
        },
        withCredentials: true,
      },
    );
    return response.data;
  },

  updateOrderStatus: async (
    orderId: string,
    status: Order["status"],
  ): Promise<Order> => {
    // Auth cookies are sent by apiClient.
    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}`,
      { status },
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
};
