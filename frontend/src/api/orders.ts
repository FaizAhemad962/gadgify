import { apiClient } from './client'
import type {
  Order,
  CreateOrderRequest,
  PaymentIntent,
} from '../types'

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders')
    return response.data
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`)
    return response.data
  },

  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders', data)
    return response.data
  },

  createPaymentIntent: async (orderId: string): Promise<PaymentIntent> => {
    const response = await apiClient.post<PaymentIntent>(
      `/orders/${orderId}/payment-intent`
    )
    return response.data
  },

  confirmPayment: async (orderId: string, paymentId: string): Promise<Order> => {
    const response = await apiClient.post<Order>(
      `/orders/${orderId}/confirm-payment`,
      { paymentId }
    )
    return response.data
  },

  // Admin APIs
  getAllOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/admin/orders')
    return response.data
  },

  updateOrderStatus: async (
    orderId: string,
    status: Order['status']
  ): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/admin/orders/${orderId}`, {
      status,
    })
    return response.data
  },
}
