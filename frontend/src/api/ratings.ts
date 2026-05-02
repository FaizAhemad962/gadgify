// src/api/ratings.ts
import { apiClient } from "./client";

export interface Rating {
  id: string;
  rating: number;
  comment?: string;
  productId: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RatingResponse {
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
}

export interface CreateRatingData {
  rating: number;
  comment?: string;
}

/**
 * Centralized query keys
 */
export const ratingsKeys = {
  all: ["ratings"] as const,
  byProduct: (productId: string) => ["ratings", productId] as const,
};

export const ratingsApi = {
  getRatings: async (productId: string): Promise<RatingResponse> => {
    const { data } = await apiClient.get(`/products/${productId}/ratings`, {
      withCredentials: true,
    });
    return data;
  },

  createRating: async (
    productId: string,
    payload: CreateRatingData,
  ): Promise<Rating> => {
    // ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
    const { data } = await apiClient.post(
      `/products/${productId}/ratings`,
      payload,
      {
        withCredentials: true,
      },
    );
    return data;
  },

  deleteRating: async (productId: string, ratingId: string): Promise<void> => {
    // ✅ SECURITY: CSRF token is automatically added by apiClient interceptor
    await apiClient.delete(`/products/${productId}/ratings/${ratingId}`, {
      withCredentials: true,
    });
  },
};
