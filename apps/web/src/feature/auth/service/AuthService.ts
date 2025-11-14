import api from '@/shared/api/api'
import { endpoints } from '@/shared/constants/endpoints'
import { ApiResponse } from 'AppModels'
import type { AxiosResponse } from 'axios'
import type {
    TChangePasswordRequest,
    TLoginRequest,
    TRefreshTokenRequest,
    TRegisterRequest,
    TResetPasswordRequest,
} from '../type/authState'

export function Login(requestBody: TLoginRequest): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.AUTH}/login`, requestBody)
}

export function Register(requestBody: TRegisterRequest): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.AUTH}/register`, requestBody)
}

export function RefreshToken(requestBody: TRefreshTokenRequest): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.AUTH}/refresh-token`, requestBody)
}

export function GetAccountProfile(): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.get(`${endpoints.ACCOUNT}/profile`)
}

export function GetUserProfile(): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.get(`${endpoints.ACCOUNT}/profile`)
}

export function RequestPasswordReset(email: string): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.AUTH}/reset-password/init?email=${encodeURIComponent(email)}`)
}

export function VerifyResetKey(key: string): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.get(`${endpoints.AUTH}/reset-password/verify?key=${encodeURIComponent(key)}`)
}

export function FinishPasswordReset(requestBody: TResetPasswordRequest): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.AUTH}/reset-password/finish`, requestBody)
}

export function ChangePassword(requestBody: TChangePasswordRequest): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.ACCOUNT}/change-password`, requestBody)
}

export function Logout(): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.AUTH}/logout`)
}

export function GoogleOAuth2Login(code: string): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.AUTH}/oauth2/google`, { code })
}

export function GetGoogleOAuth2Config(): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.get(`${endpoints.AUTH}/oauth2/google/config`)
}
