import { apiClient } from './client'
import type {
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '../types'

export const cartApi = {
  get: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>('/cart')
    return response.data
  },

  addItem: async (data: AddToCartRequest): Promise<Cart> => {
    const response = await apiClient.post<Cart>('/cart/items', data)
    return response.data
  },

  updateItem: async (
    itemId: string,
    data: UpdateCartItemRequest
  ): Promise<Cart> => {
    const response = await apiClient.put<Cart>(`/cart/items/${itemId}`, data)
    return response.data
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete<Cart>(`/cart/items/${itemId}`)
    return response.data
  },

  clear: async (): Promise<void> => {
    await apiClient.delete('/cart')
  },
}
