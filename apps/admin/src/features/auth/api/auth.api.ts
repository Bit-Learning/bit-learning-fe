import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import { endpoints } from "@/shared/constants/endpoints";
import type {
	TAdminLoginRequest,
	TAdminLoginResponse,
	TAdminUser,
} from "../types/auth.types";

export const authApi = {
	adminLogin: (
		requestBody: TAdminLoginRequest,
	): Promise<AxiosResponse<{ data: TAdminLoginResponse }>> =>
		api.post(`${endpoints.AUTH}/login-user`, requestBody),

	refreshToken: (): Promise<AxiosResponse<{ data: TAdminLoginResponse }>> =>
		api.post(`${endpoints.AUTH}/refresh-token`, {}),

	getAdminProfile: (): Promise<AxiosResponse<{ data: TAdminUser }>> =>
		api.get(`${endpoints.ACCOUNT}/profile`),

	logout: (): Promise<AxiosResponse<any>> =>
		api.post(`${endpoints.AUTH}/logout`),
};
