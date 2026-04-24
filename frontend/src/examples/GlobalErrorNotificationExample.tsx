/* eslint-disable react-refresh/only-export-components */
/**
 * Example: Using Global Error Notifications in Components
 *
 * The global error notification system provides a centralized way to handle and display
 * errors across the application using MUI Snackbar and Alert components.
 */

import { useGlobalError } from "@/hooks/useGlobalError";
import { ErrorHandler } from "@/utils/errorHandler";
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
  return null; // Component JSX here
};

/**
 * Example 3: Multiple Error Types
 */
export const ProductActionExample = () => {
  return null; // Component JSX here
};

/**
 * Example 4: Using i18n with Error Notification
 *
 * The error messages are automatically translated based on selected language
 * Error keys like 'errors.networkError' will be translated to the current language
 */
export const TranslatedErrorExample = () => {
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
  return null; // Component JSX here
};

/**
 * Example 6: Handling Different Severity Levels
 */
export const SeverityLevelsExample = () => {
  // const { showError, showWarning, showInfo, showSuccess } = useGlobalError();

  // const handleWithSeverity = async () => {
  //   try {
  //     // Assume API call
  //     showSuccess("Operation completed successfully!");
  //   } catch (error) {
  //     // Use different severity levels
  //     showSuccess("Item saved!"); // Green success notification
  //     showInfo("Please note: Feature will be unavailable tomorrow."); // Blue info
  //     showWarning("Rate limit approaching. Slow down your requests."); // Orange warning
  //     showError("Failed to save. Please try again."); // Red error
  //   }
  // };

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
