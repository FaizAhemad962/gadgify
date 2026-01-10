/**
 * URL Helper Utilities
 * Provides dynamic URL generation based on environment configuration
 */

const getBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
}

/**
 * Get full API URL for any endpoint
 * @param endpoint - API endpoint (e.g., '/products', '/users/profile')
 * @returns Full API URL
 */
export const getFullUrl = (endpoint: string): string => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${endpoint}`
}

/**
 * Get base server URL without /api
 * @returns Base server URL (e.g., 'http://localhost:5000')
 */
export const getServerBaseUrl = (): string => {
  const apiUrl = getBaseUrl()
  return apiUrl.replace('/api', '')
}

/**
 * Get upload URL for images/videos
 * @param path - Upload path (e.g., '/uploads/images/abc123.jpg')
 * @returns Full upload URL
 */
export const getUploadUrl = (path: string): string => {
  const serverUrl = getServerBaseUrl()
  return `${serverUrl}${path}`
}

/**
 * Check if URL is absolute or relative
 * @param url - URL to check
 * @returns true if absolute, false if relative
 */
export const isAbsoluteUrl = (url: string): boolean => {
  return /^https?:\/\//.test(url)
}

/**
 * Get safe URL with fallback
 * @param url - URL to validate
 * @param fallback - Fallback URL if original is invalid
 * @returns Safe URL
 */
export const getSafeUrl = (url: string | undefined, fallback = ''): string => {
  if (!url) return fallback
  try {
    new URL(url)
    return url
  } catch {
    return fallback
  }
}
