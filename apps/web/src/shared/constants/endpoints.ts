import { API_CONFIG } from '@/shared/config/api.config'

export const endpoints = {
    AUTH: '/api/auth',
    ACCOUNT: '/api/users',
}

/**
 * @deprecated Use API_CONFIG from @/shared/config/api.config instead
 * This will be removed in future versions
 */
export const API_PATH = {
    BASE_URL: {
        DEVELOPMENT: API_CONFIG.BASE_URL + '/api/',
        PRODUCTION: API_CONFIG.BASE_URL,
    },
}
