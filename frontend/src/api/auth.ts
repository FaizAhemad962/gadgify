import { apiClient } from "./client";
import type { AuthResponse, LoginRequest, SignupRequest, User } from "../types";

export interface UpdateProfileRequest {
  name: string;
  phone: string;
  city: string;
  address: string;
  pincode: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ✅ SECURITY: Get CSRF token from backend
const getCsrfToken = async (): Promise<string> => {
  try {
    const response = await apiClient.get<{ csrfToken: string }>(
      "/auth/csrf-token",
      {
        withCredentials: true,
      },
    );
    return response.data.csrfToken;
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
    throw error;
  }
};

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // ✅ SECURITY: Get CSRF token before login
    const csrfToken = await getCsrfToken();

    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      data, // Do NOT include csrfToken in body - only in header
      {
        withCredentials: true, // ✅ SECURITY: Send cookies
        headers: {
          "x-csrf-token": csrfToken, // CSRF token only in header
        },
      },
    );
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    // ✅ SECURITY: Get CSRF token before signup
    const csrfToken = await getCsrfToken();

    const response = await apiClient.post<AuthResponse>(
      "/auth/signup",
      data, // Do NOT include csrfToken in body - only in header
      {
        withCredentials: true, // ✅ SECURITY: Send cookies
        headers: {
          "x-csrf-token": csrfToken,
        },
      },
    );
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/profile", {
      withCredentials: true, // ✅ SECURITY: Send cookies
    });
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest,
  ): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put<{ message: string; user: User }>(
      "/auth/profile",
      data,
      { withCredentials: true }, // ✅ SECURITY: Send cookies
    );
    return response.data;
  },

  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      "/auth/change-password",
      data,
      { withCredentials: true }, // ✅ SECURITY: Send cookies
    );
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      "/auth/forgot-password",
      data,
      { withCredentials: true }, // ✅ SECURITY: Send cookies
    );
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordRequest,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      "/auth/reset-password",
      data,
      { withCredentials: true }, // ✅ SECURITY: Send cookies
    );
    return response.data;
  },

  uploadProfilePhoto: async (
    file: File,
  ): Promise<{ message: string; user: User }> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post<{ message: string; user: User }>(
      "/auth/profile-photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // ✅ SECURITY: Send cookies
      },
    );
    return response.data;
  },

  // ✅ SECURITY: Call backend logout endpoint to clear httpOnly cookie
  logout: async () => {
    try {
      await apiClient.post(
        "/auth/logout",
        {},
        { withCredentials: true }, // ✅ SECURITY: Send cookies
      );
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
};
