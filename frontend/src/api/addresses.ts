import { apiClient } from "./client";
import { getCsrfToken } from "./csrfHelper";

export interface Address {
  id: string;
  userId: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  label?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
  isDefault?: boolean;
}

export const addressesApi = {
  getAll: async (): Promise<Address[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: Address[];
    }>("/addresses", {
      withCredentials: true,
    });
    return response.data.data;
  },

  create: async (data: CreateAddressRequest): Promise<Address> => {
    const csrfToken = await getCsrfToken();
    const response = await apiClient.post<{
      success: boolean;
      data: Address;
    }>("/addresses", data, {
      withCredentials: true,
      headers: {
        "x-csrf-token": csrfToken,
      },
    });
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<CreateAddressRequest>,
  ): Promise<Address> => {
    const csrfToken = await getCsrfToken();
    const response = await apiClient.put<{
      success: boolean;
      data: Address;
    }>(`/addresses/${id}`, data, {
      withCredentials: true,
      headers: {
        "x-csrf-token": csrfToken,
      },
    });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    const csrfToken = await getCsrfToken();
    await apiClient.delete(`/addresses/${id}`, {
      withCredentials: true,
      headers: {
        "x-csrf-token": csrfToken,
      },
    });
  },
};
