import { apiClient } from "./client";
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from "../types";

// ✅ SECURITY: Get CSRF token from backend
const getCsrfToken = async (): Promise<string> => {
  try {
    const response = await apiClient.get<{ csrfToken: string }>(
      "/auth/csrf-token",
      {
        withCredentials: true,
      },
    );
    return response.data.csrfToken;
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
    throw error;
  }
};

export const cartApi = {
  get: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>("/cart", {
      withCredentials: true, // ✅ SECURITY: Send httpOnly cookie
    });
    return response.data;
  },

  addItem: async (data: AddToCartRequest): Promise<Cart> => {
    // ✅ SECURITY: Get CSRF token before adding to cart
    const csrfToken = await getCsrfToken();

    const response = await apiClient.post<Cart>("/cart/items", data, {
      withCredentials: true, // ✅ SECURITY: Send httpOnly cookie
      headers: {
        "x-csrf-token": csrfToken, // CSRF token in header
      },
    });
    return response.data;
  },

  updateItem: async (
    itemId: string,
    data: UpdateCartItemRequest,
  ): Promise<Cart> => {
    // ✅ SECURITY: Get CSRF token before updating cart
    const csrfToken = await getCsrfToken();

    const response = await apiClient.put<Cart>(`/cart/items/${itemId}`, data, {
      withCredentials: true, // ✅ SECURITY: Send httpOnly cookie
      headers: {
        "x-csrf-token": csrfToken, // CSRF token in header
      },
    });
    return response.data;
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    // ✅ SECURITY: Get CSRF token before removing from cart
    const csrfToken = await getCsrfToken();

    const response = await apiClient.delete<Cart>(`/cart/items/${itemId}`, {
      withCredentials: true, // ✅ SECURITY: Send httpOnly cookie
      headers: {
        "x-csrf-token": csrfToken, // CSRF token in header
      },
    });
    return response.data;
  },

  clear: async (): Promise<void> => {
    // ✅ SECURITY: Get CSRF token before clearing cart
    const csrfToken = await getCsrfToken();

    await apiClient.delete("/cart", {
      withCredentials: true, // ✅ SECURITY: Send httpOnly cookie
      headers: {
        "x-csrf-token": csrfToken, // CSRF token in header
      },
    });
  },
};
