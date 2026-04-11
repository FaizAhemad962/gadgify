import { apiClient } from "./client";

export interface Newsletter {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  data?: Newsletter;
}

export interface NewsletterListResponse {
  success: boolean;
  message: string;
  data?: {
    subscribers: Newsletter[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface NewsletterStatsResponse {
  success: boolean;
  message: string;
  data?: {
    totalSubscribers: number;
    activeSubscribers: number;
    inactiveSubscribers: number;
  };
}

export const newsletterApi = {
  // Subscribe email to newsletter
  subscribe: async (email: string) => {
    const response = await apiClient.post<NewsletterResponse>(
      "/newsletters/subscribe",
      { email },
    );
    return response.data;
  },

  // Unsubscribe email from newsletter
  unsubscribe: async (email: string) => {
    const response = await apiClient.post<NewsletterResponse>(
      "/newsletters/unsubscribe",
      { email },
    );
    return response.data;
  },

  // Get all newsletter subscribers (Admin only)
  getAllSubscribers: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) => {
    const response = await apiClient.get<NewsletterListResponse>(
      "/newsletters",
      { params },
    );
    return response.data.data;
  },

  // Get newsletter statistics (Admin only)
  getStats: async () => {
    const response =
      await apiClient.get<NewsletterStatsResponse>("/newsletters/stats");
    return response.data.data;
  },
};
