import { apiClient } from "./client";
import { getCsrfToken } from "./csrfHelper";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  state: string;
  city: string;
  createdAt: string;
  _count: { orders: number };
}

export const usersApi = {
  getAll: async (): Promise<AdminUser[]> => {
    const { data } = await apiClient.get("/admin/users", {
      withCredentials: true,
    });
    return data.data;
  },

  updateRole: async (id: string, role: string): Promise<void> => {
    const csrfToken = await getCsrfToken();
    await apiClient.patch(
      `/admin/users/${encodeURIComponent(id)}/role`,
      {
        role,
      },
      {
        withCredentials: true,
        headers: { "x-csrf-token": csrfToken },
      },
    );
  },

  delete: async (id: string): Promise<void> => {
    const csrfToken = await getCsrfToken();
    await apiClient.delete(`/admin/users/${encodeURIComponent(id)}`, {
      withCredentials: true,
      headers: { "x-csrf-token": csrfToken },
    });
  },
};
