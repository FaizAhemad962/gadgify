import { apiClient } from './client'
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
} from '../types'

export interface UpdateProfileRequest {
  name: string
  phone: string
  city: string
  address: string
  pincode: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile')
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put<{ message: string; user: User }>('/auth/profile', data)
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', data)
    return response.data
  },

  uploadProfilePhoto: async (file: File): Promise<{ message: string; user: User }> => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await apiClient.post<{ message: string; user: User }>(
      '/auth/profile-photo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}
