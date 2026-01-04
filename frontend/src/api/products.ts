import { apiClient } from './client'
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types'

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products')
    return response.data
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`)
    return response.data
  },

  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data)
    return response.data
  },

  update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },

  search: async (query: string): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(`/products/search?q=${query}`)
    return response.data
  },

  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await apiClient.post<{ imageUrl: string }>('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  uploadVideo: async (file: File): Promise<{ videoUrl: string }> => {
    const formData = new FormData()
    formData.append('video', file)
    const response = await apiClient.post<{ videoUrl: string }>('/products/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
