import { apiClient } from "./client";

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
    }>("/addresses");
    return response.data.data;
  },

  create: async (data: CreateAddressRequest): Promise<Address> => {
    const response = await apiClient.post<{
      success: boolean;
      data: Address;
    }>("/addresses", data);
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<CreateAddressRequest>,
  ): Promise<Address> => {
    const response = await apiClient.put<{
      success: boolean;
      data: Address;
    }>(`/addresses/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
  },
};
