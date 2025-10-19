import { LoginRequest, LoginResponse } from './auth.type'
import { AxiosInstance } from 'axios'

export class AuthApi {
    constructor(private readonly client: AxiosInstance) {}

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await this.client.post<LoginResponse>('/api/auth/login', credentials)
        return response.data
    }

    logout() {
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
    }

    getAccessToken(): string | null {
        return localStorage.getItem('accessToken')
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken')
    }

    setTokens(accessToken: string, refreshToken: string) {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
    }

    setUser(user: string) {
        localStorage.setItem('user', user)
    }

    getUser(): string | null {
        return localStorage.getItem('user')
    }

    isAuthenticated(): boolean {
        return !!this.getAccessToken()
    }
}
