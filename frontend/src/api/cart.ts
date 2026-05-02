import { apiClient } from "./client";
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from "../types";

// ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
export const cartApi = {
  get: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>("/cart", {
      withCredentials: true,
    });
    return response.data;
  },

  // ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
  addItem: async (data: AddToCartRequest): Promise<Cart> => {
    const response = await apiClient.post<Cart>("/cart/items", data, {
      withCredentials: true,
    });

    return response.data;
  },

  // ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
  updateItem: async (
    itemId: string,
    data: UpdateCartItemRequest,
  ): Promise<Cart> => {
    const response = await apiClient.put<Cart>(`/cart/items/${itemId}`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  // ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete<Cart>(`/cart/items/${itemId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
  clear: async (): Promise<void> => {
    await apiClient.delete("/cart", {
      withCredentials: true,
    });
  },
};
