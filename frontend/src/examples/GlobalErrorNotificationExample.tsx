/**
 * Example: Using Global Error Notifications in Components
 *
 * The global error notification system provides a centralized way to handle and display
 * errors across the application using MUI Snackbar and Alert components.
 */

import { useGlobalError } from "@/hooks/useGlobalError";
import { ErrorHandler } from "@/utils/ErrorHandler";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

/**
 * Example 1: In a React Query Mutation
 */
export const useAddProductMutation = () => {
  const { showError, showSuccess } = useGlobalError();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await apiClient.post("/products", data);
      return response.data;
    },
    onSuccess: () => {
      showSuccess("Product added successfully!");
    },
    onError: (error) => {
      const message = ErrorHandler.getUserFriendlyMessage(error);
      showError(message);
    },
  });
};

/**
 * Example 2: In a Form Submission Handler
 */
export const LoginFormExample = () => {
  const { showError, showSuccess, showWarning } = useGlobalError();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      showSuccess("Logged in successfully!");
      // Handle successful login
    } catch (error) {
      if (ErrorHandler.isRateLimitError(error)) {
        showWarning("Too many login attempts. Please try again later.");
      } else if (ErrorHandler.isNetworkError(error)) {
        showError("Network connection failed. Please check your internet.");
      } else {
        const message = ErrorHandler.getUserFriendlyMessage(error);
        showError(message);
      }
    }
  };

  return null; // Component JSX here
};

/**
 * Example 3: Multiple Error Types
 */
export const ProductActionExample = () => {
  const { showError, showInfo } = useGlobalError();

  const handleAction = async (productId: string) => {
    try {
      // Attempt API call
      const response = await apiClient.post(`/products/${productId}/action`);
      return response.data;
    } catch (error) {
      // Determine error type and show appropriate message
      if (ErrorHandler.isAuthError(error)) {
        showError("Your session has expired. Please login again.");
        // Redirect to login...
      } else if (ErrorHandler.isAuthorizationError(error)) {
        showError("You don't have permission to perform this action.");
      } else if (ErrorHandler.isServerError(error)) {
        showError("Server error. Please try again later.");
      } else if (ErrorHandler.isValidationError(error)) {
        const errors = ErrorHandler.getValidationErrors(error);
        const messages = Object.values(errors).flat().join(", ");
        showError(messages);
      } else {
        showError(ErrorHandler.getUserFriendlyMessage(error));
      }
    }
  };

  return null; // Component JSX here
};

/**
 * Example 4: Using i18n with Error Notification
 *
 * The error messages are automatically translated based on selected language
 * Error keys like 'errors.networkError' will be translated to the current language
 */
export const TranslatedErrorExample = () => {
  const { showError } = useGlobalError();

  const handleTranslatedError = async () => {
    try {
      await apiClient.get("/some-endpoint");
    } catch (error) {
      // These keys will be automatically translated
      if (ErrorHandler.isRateLimitError(error)) {
        showError("errors.tooManyRequests");
      } else if (ErrorHandler.isNetworkError(error)) {
        showError("errors.networkError");
      } else if (ErrorHandler.isServerError(error)) {
        showError("errors.serverError");
      } else {
        showError("errors.somethingWrong");
      }
    }
  };

  return null; // Component JSX here
};

/**
 * Example 5: API Client Auto-Retry
 *
 * The apiClient already includes exponential backoff retry logic for:
 * - 429 (Too Many Requests): Retries up to 5 times
 * - 5xx errors: Retries up to 3 times
 * - Network errors: Retries up to 3 times
 *
 * Components don't need to handle retries manually - they're handled by the client
 */
export const AutoRetryExample = () => {
  const { showWarning } = useGlobalError();

  const handleRequest = async () => {
    try {
      // This request will automatically retry with exponential backoff
      // if it encounters a 429 or 5xx error
      const response = await apiClient.get("/protected-endpoint");
      return response.data;
    } catch (error) {
      // Show warning if retries failed
      if (ErrorHandler.isRateLimitError(error)) {
        showWarning(
          "Still too many requests. Please wait before trying again.",
        );
      }
    }
  };

  return null; // Component JSX here
};

/**
 * Example 6: Handling Different Severity Levels
 */
export const SeverityLevelsExample = () => {
  const { showError, showWarning, showInfo, showSuccess } = useGlobalError();

  const handleWithSeverity = async () => {
    try {
      // Assume API call
      showSuccess("Operation completed successfully!");
    } catch (error) {
      // Use different severity levels
      showSuccess("Item saved!"); // Green success notification
      showInfo("Please note: Feature will be unavailable tomorrow."); // Blue info
      showWarning("Rate limit approaching. Slow down your requests."); // Orange warning
      showError("Failed to save. Please try again."); // Red error
    }
  };

  return null; // Component JSX here
};

/**
 * Key Points:
 *
 * 1. Always use `const { showError, showSuccess, showWarning, showInfo } = useGlobalError()`
 *    in components that need error handling
 *
 * 2. Use ErrorHandler utility to check error types:
 *    - ErrorHandler.isNetworkError()
 *    - ErrorHandler.isServerError()
 *    - ErrorHandler.isAuthError()
 *    - ErrorHandler.isRateLimitError()
 *    - ErrorHandler.isValidationError()
 *
 * 3. Use ErrorHandler.getUserFriendlyMessage() to get readable error messages
 *
 * 4. Error messages automatically support i18n - use error keys like "errors.networkError"
 *
 * 5. The apiClient automatically handles retries with exponential backoff
 *
 * 6. Multiple notifications stack and display at top-right corner
 *
 * 7. Notifications auto-dismiss after a configurable duration (default: 5-6 seconds)
 *
 * 8. Users can manually close notifications by clicking the X button
 */
