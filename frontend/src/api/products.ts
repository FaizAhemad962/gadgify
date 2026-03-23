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
    const params = {
      search: filters?.search || "",
      minPrice: filters?.minPrice ?? 0,
      maxPrice: filters?.maxPrice ?? 100000,
      minRating: filters?.minRating ?? 0,
      category: filters?.category || "",
      sortBy: filters?.sortBy || "popularity",
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 12,
    };

    const { data } = await apiClient.get("/products", { params });
    console.log(data);

    // Sort by primary image
    if (data.products) {
      data.products.sort((a: Product, b: Product) => {
        const aHasPrimary = a.media?.some((m) => m.isPrimary);
        const bHasPrimary = b.media?.some((m) => m.isPrimary);
        return Number(bHasPrimary) - Number(aHasPrimary);
      });
    }

    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
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
