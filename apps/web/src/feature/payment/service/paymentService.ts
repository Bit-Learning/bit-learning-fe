import type { ApiResponse } from "AppModels";
import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import { endpoints } from "@/shared/constants/endpoints";
import type { PaymentUrlRequest } from "../type/paymentType";

export function CreatePaymentURL(
	requestBody: PaymentUrlRequest,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.PAYMENT}/url`, requestBody);
}
