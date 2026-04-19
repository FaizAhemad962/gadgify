import { apiClient } from "./client";
import { getCsrfToken } from "./csrfHelper";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface FAQsResponse {
  success: boolean;
  data: {
    faqs: FAQ[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: string[];
  };
}

export const faqApi = {
  // Get all FAQs with optional category filter
  getAll: async (params?: {
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<FAQsResponse>("/faqs", {
      params,
      withCredentials: true,
    });
    return response.data.data;
  },

  // Get FAQ categories
  getCategories: async () => {
    const response = await apiClient.get<CategoriesResponse>(
      "/faqs/categories",
      {
        withCredentials: true,
      },
    );
    return response.data.data.categories;
  },

  // Get FAQs for specific category
  getByCategory: async (category: string, page = 1, limit = 10) => {
    return faqApi.getAll({ category, page, limit });
  },

  // Increment FAQ view count
  incrementViews: async (faqId: string) => {
    const csrfToken = await getCsrfToken();
    const response = await apiClient.patch<{
      success: boolean;
      data: { faq: FAQ };
    }>(
      `/faqs/${faqId}/views`,
      {},
      {
        withCredentials: true,
        headers: { "x-csrf-token": csrfToken },
      },
    );
    return response.data.data.faq;
  },
};
