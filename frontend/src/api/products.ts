import { apiClient } from "./client";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types";

export const productsApi = {
  // ---------------- PUBLIC ----------------
  getAll: async (filters?: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    category?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> => {
    // Only add parameters that are explicitly provided
    const params: Record<string, any> = {};

    if (filters?.search) params.search = filters.search;
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.minRating !== undefined) params.minRating = filters.minRating;
    if (filters?.category) params.category = filters.category;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit ?? 24;

    const { data } = await apiClient.get("/products", { params });

    // Support both API shapes:
    // 1) { products, total, page, limit }
    // 2) { success, message, data: { products, total, page, limit } }
    const payload = (data as any)?.data ?? data;
    const products: Product[] = Array.isArray(payload?.products)
      ? payload.products
      : [];

    // Keep products with primary image at top for better UX
    products.sort((a: Product, b: Product) => {
      const aHasPrimary = a.media?.some((m) => m.isPrimary);
      const bHasPrimary = b.media?.some((m) => m.isPrimary);
      return Number(bHasPrimary) - Number(aHasPrimary);
    });

    return {
      products,
      total: Number(payload?.total ?? products.length),
      page: Number(payload?.page ?? filters?.page ?? 1),
      limit: Number(payload?.limit ?? filters?.limit ?? 12),
    };
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  getSuggestions: async (
    q: string,
  ): Promise<
    Array<{
      id: string;
      name: string;
      price: number;
      category: string;
      image: string | null;
    }>
  > => {
    const { data } = await apiClient.get("/products/suggestions", {
      params: { q },
    });
    return data.data;
  },

  create: async (payload: CreateProductRequest): Promise<Product> => {
    const { data } = await apiClient.post("/products", payload);
    return data;
  },

  update: async (
    id: string,
    payload: UpdateProductRequest,
  ): Promise<Product> => {
    const { data } = await apiClient.put(`/products/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  deleteMediaByUrlAndProductId: async (
    productId: string,
    url: string,
  ): Promise<void> => {
    await apiClient.delete("/products/media", {
      data: { productId, url },
    });
  },

  // ---------------- ADMIN ----------------
  getAllProducts: async (
    page = 1,
    limit = 25,
    search = "",
  ): Promise<{ products: Product[]; total: number }> => {
    const { data } = await apiClient.get("/admin/products", {
      params: { page, limit, search },
    });
    return data;
  },

  // ---------------- UPLOADS ----------------
  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append("image", file);

    const { data } = await apiClient.post("/products/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  uploadVideo: async (file: File): Promise<{ videoUrl: string }> => {
    const formData = new FormData();
    formData.append("video", file);

    const { data } = await apiClient.post("/products/upload-video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
