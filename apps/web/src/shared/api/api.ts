import { getAccessToken, getRefreshToken, setAuthTokens, clearAuthTokens } from '@/shared/lib/cookies'
import {
    AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:6979/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept-Language': localStorage.getItem('i18nextLng') || 'vi',
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

function handleRefreshToken(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
        return Promise.reject(new Error('No refresh token available'))
    }

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
            },
        )
        .then((response: AxiosResponse) => {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data
            if (!accessToken || !newRefreshToken) {
                throw new Error('Invalid refresh token response')
            }
            setAuthTokens(accessToken, newRefreshToken)
            // Update default headers directly
            if (api.defaults.headers) {
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            }

            failedRequestQueue.forEach(({ resolve }) => resolve(api.request(response)))
            failedRequestQueue = []
        })
        .catch((error: AxiosError) => {
            failedRequestQueue.forEach(({ reject }) => reject(error))
            failedRequestQueue = []
            clearAuthTokens()
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

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
        originalRequest._retry = true
        const refreshToken = getRefreshToken()

        if (isRefreshing) {
            // Queue the request until the refresh is complete
            return new Promise((resolve, reject) => {
                failedRequestQueue.push({ resolve, reject })
            })
        }

        try {
            await handleRefreshToken(refreshToken)
            const newAccessToken = getAccessToken()
            if (newAccessToken) {
                setAuthorizationHeader({
                    request: originalRequest,
                    token: newAccessToken,
                })
                return api.request(originalRequest)
            }
            throw new Error('No new access token available after refresh')
        } catch (refreshError) {
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
