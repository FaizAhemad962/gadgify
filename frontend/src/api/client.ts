/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
  // ✅ SECURITY: Enable cross-domain cookie support (for production domains)
  withCredentials: true,
});

// Request interceptor to handle auth cookies and request formatting.
apiClient.interceptors.request.use(
  async (config: any) => {
    // ✅ SECURITY: Token is now in httpOnly cookie, sent automatically by browser
    // No need to manually add Authorization header
    config.withCredentials = true; // Ensure cookies are sent

    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;
    if (isFormData && config.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
        config.headers.delete("content-type");
      } else {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }

    // Initialize retry count
    if (!config.retryCount) {
      config.retryCount = 0;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Exponential backoff delay function
const getRetryDelay = (retryCount: number, maxDelay = 60000): number => {
  const delay = Math.min(Math.pow(2, retryCount) * 2000, maxDelay);
  return delay;
};

// Response interceptor for error handling with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as any;
    const isAuthEndpoint =
      config?.url?.includes("/auth/login") ||
      config?.url?.includes("/auth/signup");
    const status = error.response?.status;
    // ✅ SECURITY: 401 Unauthorized - redirect to login
    if (status === 401 && !isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Retry logic for specific status codes
    const shouldRetry =
      status === 429 || // Too Many Requests
      (status && status >= 500) || // Server errors (5xx)
      error.code === "ECONNABORTED" || // Timeout
      error.code === "ENOTFOUND"; // Network error

    const maxRetriesFor429 = 1; // Single retry for rate limits
    const maxRetriesFor5xx = 2;
    const maxRetriesForNetwork = 2;

    let maxRetries = 1;
    if (status === 429) {
      maxRetries = maxRetriesFor429;
    } else if (status && status >= 500) {
      maxRetries = maxRetriesFor5xx;
    } else if (!status) {
      maxRetries = maxRetriesForNetwork;
    }

    if (shouldRetry && config.retryCount < maxRetries) {
      config.retryCount++;
      const delay = getRetryDelay(config.retryCount - 1);

      // Store retry info for logging
      config.isRetry = true;
      config.retryDelay = delay;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      return apiClient(config);
    }

    return Promise.reject(error);
  },
);
