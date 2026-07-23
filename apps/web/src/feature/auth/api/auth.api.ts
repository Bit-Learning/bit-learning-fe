import type { ApiResponse } from "AppModels";
import type { AxiosResponse } from "axios";
import type { TChangePasswordRequest } from "@/feature/user/types/user.type";
import api from "@/shared/api/api";
import { endpoints } from "@/shared/constants/endpoints";
import type {
	TLoginRequest,
	TLoginRoleRequest,
	TRegisterRequest,
	TResetPasswordRequest,
} from "../types/auth.type";

export const authApi = {
	login: (
		requestBody: TLoginRequest,
	): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/login`, requestBody),

	loginUser: (
		requestBody: TLoginRoleRequest,
	): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/login-user`, requestBody),

	register: (
		requestBody: TRegisterRequest,
	): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/register`, requestBody),

	activateAccount: (
		key: string,
	): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.get(`${endpoints.AUTH}/activate?key=${encodeURIComponent(key)}`),

	getUserProfile: (): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.get(`${endpoints.ACCOUNT}/profile`),

	requestPasswordReset: (
		email: string,
	): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(
			`${endpoints.AUTH}/reset-password/init?email=${encodeURIComponent(email)}`,
		),

	verifyResetKey: (
		key: string,
	): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.get(
			`${endpoints.AUTH}/reset-password/verify?key=${encodeURIComponent(key)}`,
		),

	finishPasswordReset: (
		requestBody: TResetPasswordRequest,
	): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/reset-password/finish`, requestBody),

	changePassword: (
		requestBody: TChangePasswordRequest,
	): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.ACCOUNT}/change-password`, requestBody),

	logout: (): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/logout`),

	googleOAuth2Login: (
		code: string,
	): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/oauth2/google`, { code }),

	getGoogleOAuth2Config: (): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.get(`${endpoints.AUTH}/oauth2/google/config`),

	gitHubOAuth2Login: (
		code: string,
	): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/oauth2/github`, { code }),

	getGitHubOAuth2Config: (): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.get(`${endpoints.AUTH}/oauth2/github/config`),

	// MFA
	enable2FA: (): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/2fa/enable`),

	verify2FA: (requestBody: {
		totpCode: string;
	}): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/2fa/verify`, requestBody),

	disable2FA: (): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.delete(`${endpoints.AUTH}/2fa/disable`),

	loginWith2FA: (requestBody: {
		email: string;
		password: string;
		totpCode: string;
	}): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/login/2fa`, requestBody),

	complete2FA: (requestBody: {
		email: string;
		totpCode: string;
	}): Promise<AxiosResponse<ApiResponse<any>, any>> =>
		api.post(`${endpoints.AUTH}/2fa/complete`, requestBody),

	// QR Code Login
	generateQRToken: (): Promise<
		AxiosResponse<ApiResponse<{ qrToken: string }>, any>
	> => api.get(`${endpoints.AUTH}/qr/generate`),
};
