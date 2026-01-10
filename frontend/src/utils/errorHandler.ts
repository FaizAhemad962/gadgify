import { AxiosError } from 'axios'

export interface ApiError {
  message: string
  status?: number
  code?: string
  timestamp?: string
}

export class ErrorHandler {
  /**
   * Extract error message from various error sources
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      // API error response
      return error.response?.data?.message || 
             error.response?.statusText || 
             error.message ||
             'Network error occurred'
    }

    if (error instanceof Error) {
      return error.message
    }

    if (typeof error === 'string') {
      return error
    }

    return 'An unknown error occurred'
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
    const message = this.getErrorMessage(error)

    // Map common error messages to user-friendly versions
    const errorMap: { [key: string]: string } = {
      'ECONNREFUSED': 'Unable to connect to server. Please check your internet connection.',
      'ETIMEDOUT': 'Request timed out. Please try again.',
      'Network Error': 'Network connection failed. Please check your internet.',
      'Invalid email address': 'Please enter a valid email address.',
      'Password must be at least 6 characters': 'Password must be at least 6 characters long.',
      'Passwords don\'t match': 'Passwords do not match.',
      'already exists': 'This account already exists.',
      'not found': 'Requested item not found.',
      'unauthorized': 'You are not authorized to perform this action.',
      'forbidden': 'Access denied.',
      '401': 'Your session has expired. Please login again.',
      '403': 'You do not have permission to access this resource.',
      '404': 'The requested resource was not found.',
      '500': 'Server error. Please try again later.',
      '503': 'Service temporarily unavailable. Please try again later.',
    }

    // Check for matching error patterns
    const lowerMessage = message.toLowerCase()
    for (const [key, friendlyMsg] of Object.entries(errorMap)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return friendlyMsg
      }
    }

    return fallback
  }

  /**
   * Extract validation errors from API response
   */
  static getValidationErrors(error: unknown): Record<string, string[]> {
    if (error instanceof AxiosError) {
      const data = error.response?.data as any
      
      if (data?.errors && typeof data.errors === 'object') {
        return data.errors
      }

      if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
        return data.fieldErrors
      }

      if (data?.validation && typeof data.validation === 'object') {
        return data.validation
      }
    }

    return {}
  }

  /**
   * Check if error is validation error
   */
  static isValidationError(error: unknown): boolean {
    const validationErrors = this.getValidationErrors(error)
    return Object.keys(validationErrors).length > 0
  }

  /**
   * Check if error is authentication error
   */
  static isAuthError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return error.response?.status === 401
    }
    return false
  }

  /**
   * Check if error is authorization error
   */
  static isAuthorizationError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return error.response?.status === 403
    }
    return false
  }

  /**
   * Check if error is server error
   */
  static isServerError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      const status = error.response?.status
      return status ? status >= 500 : false
    }
    return false
  }

  /**
   * Check if error is network error
   */
  static isNetworkError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return !error.response && (!!error.code || error.message.includes('Network'))
    }
    return false
  }

  /**
   * Check if error is rate limit error
   */
  static isRateLimitError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return error.response?.status === 429
    }
    return false
  }

  /**
   * Log error to console with context
   */
  static logError(context: string, error: unknown): void {
    const message = this.getErrorMessage(error)
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] ${context}: ${message}`, error)
  }

  /**
   * Safe JSON stringify for logging
   */
  static safeStringify(obj: unknown): string {
    try {
      return JSON.stringify(obj)
    } catch {
      return String(obj)
    }
  }
}

/**
 * Hook for React components to handle errors
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, context = 'Operation failed'): string => {
    ErrorHandler.logError(context, error)
    return ErrorHandler.getUserFriendlyMessage(error)
  }

  return { handleError }
}
