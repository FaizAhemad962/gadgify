// src/api/ratings.ts
import { apiClient } from "./client";
import { getCsrfToken } from "./csrfHelper";

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
    const csrfToken = await getCsrfToken();
    const { data } = await apiClient.post(
      `/products/${productId}/ratings`,
      payload,
      {
        withCredentials: true,
        headers: { "x-csrf-token": csrfToken },
      },
    );
    return data;
  },

  deleteRating: async (productId: string, ratingId: string): Promise<void> => {
    const csrfToken = await getCsrfToken();
    await apiClient.delete(`/products/${productId}/ratings/${ratingId}`, {
      withCredentials: true,
      headers: { "x-csrf-token": csrfToken },
    });
  },
};
