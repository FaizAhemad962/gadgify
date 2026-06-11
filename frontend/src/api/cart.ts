import { apiClient } from "./client";
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from "../types";

// Auth cookies are sent by apiClient.
export const cartApi = {
  get: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>("/cart", {
      withCredentials: true,
    });
    return response.data;
  },

  // Auth cookies are sent by apiClient.
  addItem: async (data: AddToCartRequest): Promise<Cart> => {
    const response = await apiClient.post<Cart>("/cart/items", data, {
      withCredentials: true,
    });

    return response.data;
  },

  // Auth cookies are sent by apiClient.
  updateItem: async (
    itemId: string,
    data: UpdateCartItemRequest,
  ): Promise<Cart> => {
    const response = await apiClient.put<Cart>(`/cart/items/${itemId}`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  // Auth cookies are sent by apiClient.
  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete<Cart>(`/cart/items/${itemId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Auth cookies are sent by apiClient.
  clear: async (): Promise<void> => {
    await apiClient.delete("/cart", {
      withCredentials: true,
    });
  },
};
