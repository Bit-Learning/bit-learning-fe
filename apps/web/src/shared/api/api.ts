import { API_CONFIG } from '@/shared/config/api.config'
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '@/shared/lib/cookies'
import axios, {
    AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios'

const api: AxiosInstance = axios.create({
    baseURL: API_PATH.BASE_URL,
    headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        'Accept-Language': localStorage.getItem('i18nextLng') || 'vi',
        'ngrok-skip-browser-warning': 'true',
    },
})

let isRefreshing = false
let failedRequestQueue: Array<{
    resolve: (value: any) => void
    reject: (reason?: any) => void
}> = []

function setAuthorizationHeader(params: { request: AxiosRequestConfig; token: string }) {
    const { request, token } = params
    if (request.headers) {
        request.headers['Authorization'] = `Bearer ${token}`
    }
}

function handleRefreshToken(refreshToken: string | undefined): Promise<string> {
    if (!refreshToken) {
        console.error('[Token Refresh] No refresh token available')
        return Promise.reject(new Error('No refresh token available'))
    }

    console.log('[Token Refresh] Starting token refresh process')
    isRefreshing = true

    return api
        .post(
            '/auth/refresh-token',
            {
                refreshToken,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                // Skip auth interceptor for refresh token request
                _retry: true,
            } as any,
        )
        .then((response: AxiosResponse) => {
            console.log('[Token Refresh] Refresh successful')
            const { accessToken, refreshToken: newRefreshToken } = response.data.data
            if (!accessToken || !newRefreshToken) {
                throw new Error('Invalid refresh token response')
            }
            setAuthTokens(accessToken, newRefreshToken)
            // Update default headers directly
            if (api.defaults.headers) {
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            }

            console.log(`[Token Refresh] Processing ${failedRequestQueue.length} queued requests`)
            failedRequestQueue.forEach(({ resolve }) => resolve(accessToken))
            failedRequestQueue = []
            return accessToken
        })
        .catch((error: AxiosError) => {
            console.error('[Token Refresh] Refresh failed:', error.response?.status, error.response?.data)
            failedRequestQueue.forEach(({ reject }) => reject(error))
            failedRequestQueue = []
            clearAuthTokens()
            console.log('[Token Refresh] Redirecting to signin')
            window.location.href = '/signin'
            throw error
        })
        .finally(() => {
            isRefreshing = false
        })
}

function onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = getAccessToken()
    if (token) {
        setAuthorizationHeader({ request: config, token })
    }
    return config
}

function onRequestError(error: AxiosError): Promise<never> {
    return Promise.reject(error)
}

function onResponse(response: AxiosResponse): AxiosResponse {
    return response
}

async function onResponseError(error: AxiosError): Promise<any> {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
    }

    // Don't try to refresh token for auth endpoints
    const authEndpoints = [
        '/auth/login',
        '/auth/login-user',
        '/auth/register',
        '/auth/refresh-token',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/activate',
    ]
    const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint))

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        console.log('[Auth] 401 error detected for:', originalRequest.url)
        const refreshToken = getRefreshToken()

        // If no refresh token, clear auth and redirect
        if (!refreshToken) {
            console.log('[Auth] No refresh token found, logging out')
            clearAuthTokens()
            window.location.href = '/signin'
            return Promise.reject(error)
        }

        originalRequest._retry = true

        if (isRefreshing) {
            console.log('[Auth] Token refresh in progress, queueing request:', originalRequest.url)
            // Queue the request until the refresh is complete
            return new Promise((resolve, reject) => {
                failedRequestQueue.push({
                    resolve: (token: string) => {
                        console.log('[Auth] Retrying queued request:', originalRequest.url)
                        setAuthorizationHeader({
                            request: originalRequest,
                            token,
                        })
                        resolve(api.request(originalRequest))
                    },
                    reject,
                })
            })
        }

        try {
            console.log('[Auth] Attempting to refresh token')
            const newAccessToken = await handleRefreshToken(refreshToken)
            if (newAccessToken) {
                console.log('[Auth] Token refreshed, retrying original request:', originalRequest.url)
                setAuthorizationHeader({
                    request: originalRequest,
                    token: newAccessToken,
                })
                return api.request(originalRequest)
            }
            throw new Error('No new access token available after refresh')
        } catch (refreshError) {
            console.error('[Auth] Token refresh failed:', refreshError)
            return Promise.reject(refreshError)
        }
    }

    return Promise.reject(error)
}

export function setupInterceptors(axiosInstance: AxiosInstance): AxiosInstance {
    axiosInstance.interceptors.request.use(onRequest, onRequestError)
    axiosInstance.interceptors.response.use(onResponse, onResponseError)
    return axiosInstance
}

export default setupInterceptors(api)
