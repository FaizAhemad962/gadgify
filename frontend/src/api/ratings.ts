import { apiClient } from './client'

export interface Rating {
  id: string
  rating: number
  comment?: string
  productId: string
  userId: string
  user: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface RatingResponse {
  ratings: Rating[]
  averageRating: number
  totalRatings: number
}

export interface CreateRatingData {
  rating: number
  comment?: string
}

export const ratingsApi = {
  getRatings: async (productId: string): Promise<RatingResponse> => {
    const response = await apiClient.get(`/products/${productId}/ratings`)
    return response.data
  },

  createRating: async (productId: string, data: CreateRatingData): Promise<Rating> => {
    const response = await apiClient.post(`/products/${productId}/ratings`, data)
    return response.data
  },

  deleteRating: async (productId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}/ratings`)
  },
}
