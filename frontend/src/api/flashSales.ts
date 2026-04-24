import { apiClient } from "./client";

export interface FlashSale {
  id: string;
  productId?: string;
  title: string;
  description?: string;
  discountPercentage: number;
  maxDiscount?: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlashSalesResponse {
  success: boolean;
  data: {
    flashSales: FlashSale[];
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface FlashSaleResponse {
  success: boolean;
  data: {
    flashSale: FlashSale;
  };
}

export const flashSaleApi = {
  // Get all active flash sales
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get<FlashSalesResponse>("/flash-sales", {
      params,
      withCredentials: true,
    });
    return response.data.data;
  },

  // Get single flash sale by ID
  getById: async (id: string) => {
    const response = await apiClient.get<FlashSaleResponse>(
      `/flash-sales/${id}`,
      { withCredentials: true },
    );
    return response.data.data.flashSale;
  },

  // Get upcoming flash sales (next 5)
  getUpcoming: async () => {
    const response = await apiClient.get<FlashSalesResponse>(
      "/flash-sales/upcoming",
      { withCredentials: true },
    );
    return response.data.data.flashSales;
  },
};
