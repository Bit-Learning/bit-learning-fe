export interface LoginRequest {
    username: string
    password: string
}

export interface User {
    id: number
    username: string
    email: string
    activated: boolean
    role: string
    activationKey: string
    resetKey: string | null
    langKey: string
    lastLoginAttempt: number
}

export interface LoginData {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: number
    refreshExpiresIn: number
    user: User
}

export interface LoginResponse {
    type: 'success' | 'error'
    message: string
    data: LoginData
}

export interface ApiErrorResponse {
    type: 'error'
    message: string
    data?: unknown
}
