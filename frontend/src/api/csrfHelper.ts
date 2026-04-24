import { apiClient } from "./client";

interface CsrfCache {
  token: string;
  expiresAt: number;
}

let csrfTokenCache: CsrfCache | null = null;
let csrfTokenFetchPromise: Promise<string> | null = null;

/**
 * ✅ SECURITY: Get or refresh CSRF token
 * Caches token for 40 seconds (refresh 10 seconds before 50-second mark)
 * Handles concurrent requests by preventing multiple simultaneous fetches
 */
export const getCsrfToken = async (): Promise<string> => {
  const now = Date.now();

  // If fetch is already in progress, wait for it instead of making another request
  if (csrfTokenFetchPromise) {
    return csrfTokenFetchPromise;
  }

  // Return cached token if still valid and not near expiry
  // Refresh 10 seconds before expiry to avoid race conditions
  if (csrfTokenCache && now < csrfTokenCache.expiresAt - 10000) {
    return csrfTokenCache.token;
  }

  try {
    // Mark that fetch is in progress
    csrfTokenFetchPromise = (async () => {
      const response = await apiClient.get<{ csrfToken: string }>(
        "/auth/csrf-token",
        {
          withCredentials: true,
        },
      );

      const newToken = response.data.csrfToken;
      const cacheTime = now + 50000; // Cache for 50 seconds

      csrfTokenCache = {
        token: newToken,
        expiresAt: cacheTime,
      };

      return newToken;
    })();

    const token = await csrfTokenFetchPromise;
    return token;
  } catch (error) {
    console.error("Failed to get CSRF token:", error);
    // ✅ SECURITY: Clear the promise so next request can retry
    csrfTokenFetchPromise = null;
    throw error;
  } finally {
    // Clear the promise reference after completion
    csrfTokenFetchPromise = null;
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
