import { apiClient } from "./client";

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  discount: number;
  maxDiscount: number | null;
  minOrderAmount: number;
}

export interface CreateCouponRequest {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  expiresAt?: string | null;
}

export const couponsApi = {
  // User: validate coupon
  validate: async (
    code: string,
    subtotal: number,
  ): Promise<CouponValidation> => {
    const response = await apiClient.post<{
      success: boolean;
      data: CouponValidation;
    }>("/coupons/validate", { code, subtotal });
    return response.data.data;
  },

  // Admin: get all coupons
  getAll: async (): Promise<Coupon[]> => {
    const response = await apiClient.get<{ success: boolean; data: Coupon[] }>(
      "/coupons",
    );
    return response.data.data;
  },

  // Admin: create coupon
  create: async (data: CreateCouponRequest): Promise<Coupon> => {
    const response = await apiClient.post<{ success: boolean; data: Coupon }>(
      "/coupons",
      data,
    );
    return response.data.data;
  },

  // Admin: update coupon
  update: async (
    id: string,
    data: Partial<CreateCouponRequest> & { isActive?: boolean },
  ): Promise<Coupon> => {
    const response = await apiClient.put<{ success: boolean; data: Coupon }>(
      `/coupons/${id}`,
      data,
    );
    return response.data.data;
  },

  // Admin: delete coupon
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/coupons/${id}`);
  },
};
