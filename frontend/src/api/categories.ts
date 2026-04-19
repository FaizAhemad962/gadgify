import { apiClient } from "./client";
import { getCsrfToken } from "./csrfHelper";

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
    }>("/categories", { withCredentials: true });
    return response.data.data;
  },

  // Admin: get all categories (including inactive)
  getAllAdmin: async (): Promise<Category[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: Category[];
    }>("/categories/all", { withCredentials: true });
    return response.data.data;
  },

  // Admin: create category
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const csrfToken = await getCsrfToken();
    const response = await apiClient.post<{
      success: boolean;
      data: Category;
    }>("/categories", data, {
      withCredentials: true,
      headers: { "x-csrf-token": csrfToken },
    });
    return response.data.data;
  },

  // Admin: update category
  update: async (
    id: string,
    data: Partial<CreateCategoryRequest> & { isActive?: boolean },
  ): Promise<Category> => {
    const csrfToken = await getCsrfToken();
    const response = await apiClient.put<{
      success: boolean;
      data: Category;
    }>(`/categories/${id}`, data, {
      withCredentials: true,
      headers: { "x-csrf-token": csrfToken },
    });
    return response.data.data;
  },

  // Admin: delete category
  delete: async (id: string): Promise<void> => {
    const csrfToken = await getCsrfToken();
    await apiClient.delete(`/categories/${id}`, {
      withCredentials: true,
      headers: { "x-csrf-token": csrfToken },
    });
  },
};
