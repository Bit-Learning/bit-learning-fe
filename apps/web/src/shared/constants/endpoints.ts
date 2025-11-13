export const endpoints = {
    AUTH: '/auth',
    ACCOUNT: '/users',
    PAYMENT: '/payment',
    SLIDE: '/slides',
    CHAT: '/slides/chat',
}

/**
 * @deprecated Use API_CONFIG from @/shared/config/api.config instead
 * This will be removed in future versions
 */
export const API_PATH = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api',
}
