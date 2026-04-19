import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RetryConfig {
  retryCount?: number;
  maxRetries?: number;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
  // ✅ SECURITY: Enable httpOnly cookie support
  withCredentials: true,
});

// Request interceptor to handle auth
apiClient.interceptors.request.use(
  (config: any) => {
    // ✅ SECURITY: Token is now in httpOnly cookie, sent automatically by browser
    // No need to manually add Authorization header
    config.withCredentials = true; // Ensure cookies are sent

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
const getRetryDelay = (retryCount: number, maxDelay = 30000): number => {
  const delay = Math.min(Math.pow(2, retryCount) * 1000, maxDelay);
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
    // Browser will clear httpOnly cookie automatically
    if (status === 401 && !isAuthEndpoint) {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Retry logic for specific status codes
    const shouldRetry =
      status === 429 || // Too Many Requests
      (status && status >= 500) || // Server errors (5xx)
      error.code === "ECONNABORTED" || // Timeout
      error.code === "ENOTFOUND"; // Network error

    const maxRetriesFor429 = 5;
    const maxRetriesFor5xx = 3;
    const maxRetriesForNetwork = 3;

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
