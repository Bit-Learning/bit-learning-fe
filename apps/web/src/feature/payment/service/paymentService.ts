import api from '@/shared/api/api'
import { endpoints } from '@/shared/constants/endpoints'
import { ApiResponse } from 'AppModels'
import { AxiosResponse } from 'axios'
import { PaymentUrlRequest } from '../type/paymentType'

export function CreatePaymentURL(requestBody: PaymentUrlRequest): Promise<AxiosResponse<ApiResponse<any>, any>> {
    return api.post(`${endpoints.PAYMENT}/url`, requestBody)
}
