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

  addItem: async (data: AddToCartRequest): Promise<Cart> => {
    // ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
    const response = await apiClient.post<Cart>("/cart/items", data, {
      withCredentials: true,
    });
    return response.data;
  },

  updateItem: async (
    itemId: string,
    data: UpdateCartItemRequest,
  ): Promise<Cart> => {
    // ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
    const response = await apiClient.put<Cart>(`/cart/items/${itemId}`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    // ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
    const response = await apiClient.delete<Cart>(`/cart/items/${itemId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  clear: async (): Promise<void> => {
    // ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
    await apiClient.delete("/cart", {
      withCredentials: true,
    });
  },
};
