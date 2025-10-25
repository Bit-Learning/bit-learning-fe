import type {
    TForgotPasswordRequest,
    TLoginRequest,
    TRefreshTokenRequest,
    TRegisterRequest,
    TResetPasswordRequest,
} from '../type/authState'
import api from '@/shared/api/api'
import { endpoints } from '@/shared/constants/endpoints'
import { ApiResponse } from 'AppModels'
import type { AxiosResponse } from 'axios'

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

export function ForgotPassword(requestBody: TForgotPasswordRequest): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.AUTH}/forgot-password`, requestBody)
}

export function ResetPassword(requestBody: TResetPasswordRequest): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.AUTH}/reset-password`, requestBody)
}
