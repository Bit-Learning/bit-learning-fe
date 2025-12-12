export const endpoints = {
    AUTH: '/auth',
    ACCOUNT: '/users',
    PAYMENT: '/payment',
    SLIDE: '/slides',
    CHAT: '/slides/chat',
    COURSES: '/courses',
    SECTIONS: '/sections',
    LECTURES: '/lectures',
    LECTURE_VIDEO: '/lectures/lectures-videos',
    LECTURE_QUIZ: '/lectures/lectures-quizzes',
}

/**
 * @deprecated Use API_CONFIG from @/shared/config/api.config instead
 * This will be removed in future versions
 */
export const API_PATH = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    // BASE_PRODUCT_URL: import.meta.env.VITE_PRODUCT_API_BASE_URL ?? 'http://localhost:4004/api',
    BASE_PRODUCT_URL: 'http://103.90.227.219:4004/api',
}
