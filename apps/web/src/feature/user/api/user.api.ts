import api from '@/shared/api/api'
import { endpoints } from '@/shared/constants/endpoints'
import { ApiResponse } from 'AppModels'
import type { AxiosResponse } from 'axios'
import { TChangePasswordRequest, TUserProfile } from '../types/user.type'

export function GetUserProfile(): Promise<AxiosResponse<ApiResponse<TUserProfile>, any>> {
    return api.get(`${endpoints.ACCOUNT}/profile`)
}

export function ChangePassword(requestBody: TChangePasswordRequest): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.ACCOUNT}/change-password`, requestBody)
}
