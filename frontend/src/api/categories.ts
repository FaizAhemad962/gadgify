import { apiClient } from "./client";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
}

export const categoriesApi = {
  // Public: get active categories
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: Category[];
    }>("/categories");
    return response.data.data;
  },

  // Admin: get all categories (including inactive)
  getAllAdmin: async (): Promise<Category[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: Category[];
    }>("/categories/all");
    return response.data.data;
  },

  // Admin: create category
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<{
      success: boolean;
      data: Category;
    }>("/categories", data);
    return response.data.data;
  },

  // Admin: update category
  update: async (
    id: string,
    data: Partial<CreateCategoryRequest> & { isActive?: boolean },
  ): Promise<Category> => {
    const response = await apiClient.put<{
      success: boolean;
      data: Category;
    }>(`/categories/${id}`, data);
    return response.data.data;
  },

  // Admin: delete category
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
