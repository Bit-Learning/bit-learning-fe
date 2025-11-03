/**
 * API Configuration
 *
 * Centralized configuration for all API endpoints.
 *
 * CÁCH ĐỔI API URL:
 * 1. Đổi trực tiếp trong file này (dòng BASE_URL bên dưới)
 * 2. Hoặc tạo file .env.local và set VITE_API_BASE_URL
 *
 * VÍ DỤ .env.local:
 * VITE_API_BASE_URL=http://localhost:4000
 * VITE_API_TIMEOUT=30000
 */

export const API_CONFIG = {
    /**
     * Base URL for all API requests
     *
     * ⚠️ THAY ĐỔI URL TẠI ĐÂY ⚠️
     *
     * Development: http://localhost:4000
     * Production: https://api.yourdomain.com
     *
     * Hoặc sử dụng environment variable VITE_API_BASE_URL
     */
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',

    /**
     * Request timeout in milliseconds (default: 30 seconds)
     *
     * Hoặc sử dụng environment variable VITE_API_TIMEOUT
     */
    TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

    /**
     * API version prefix
     */
    API_VERSION: '/api',

    /**
     * Default headers
     */
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
    },
} as const

/**
 * Helper function to get the full API URL
 */
export const getApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`
}

/**
 * Environment-specific configuration
 * You can use this to detect the environment and set different URLs
 */
export const getEnvironment = (): 'development' | 'production' => {
    // Check if running in production
    if (import.meta.env.PROD) {
        return 'production'
    }
    return 'development'
}

/**
 * Get the appropriate API URL based on environment
 */
export const getEnvironmentApiUrl = (): string => {
    const env = getEnvironment()

    // You can define different URLs for different environments
    const environmentUrls = {
        development: 'http://localhost:4000',
        production: 'https://api.yourdomain.com', // Replace with your production URL
    }

    return environmentUrls[env]
}
