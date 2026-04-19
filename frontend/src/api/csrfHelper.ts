import { apiClient } from "./client";

let csrfTokenCache: { token: string; expiresAt: number } | null = null;

/**
 * ✅ SECURITY: Get or refresh CSRF token
 * Caches token for 50 seconds to avoid too many requests
 */
export const getCsrfToken = async (): Promise<string> => {
  const now = Date.now();

  // Return cached token if still valid
  if (csrfTokenCache && now < csrfTokenCache.expiresAt) {
    return csrfTokenCache.token;
  }

  try {
    const response = await apiClient.get<{ csrfToken: string }>(
      "/auth/csrf-token",
      {
        withCredentials: true,
      },
    );

    csrfTokenCache = {
      token: response.data.csrfToken,
      expiresAt: now + 50000, // Cache for 50 seconds
    };

    return csrfTokenCache.token;
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
    throw error;
  }
};

/**
 * ✅ SECURITY: Get headers for protected requests (POST/PUT/DELETE)
 */
export const getProtectedHeaders = async () => {
  const csrfToken = await getCsrfToken();
  return {
    "x-csrf-token": csrfToken,
    "Content-Type": "application/json",
  };
};

/**
 * ✅ SECURITY: Get headers for file uploads
 */
export const getFileUploadHeaders = async () => {
  const csrfToken = await getCsrfToken();
  return {
    "x-csrf-token": csrfToken,
    // Do NOT set Content-Type for FormData - browser will set it with boundary
  };
};
