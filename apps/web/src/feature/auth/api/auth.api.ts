import type { ApiResponse } from "AppModels";
import type { AxiosResponse } from "axios";
import type { TChangePasswordRequest } from "@/feature/user/types/user.type";
import api from "@/shared/api/api";
import { endpoints } from "@/shared/constants/endpoints";
import type {
	TLoginRequest,
	TRegisterRequest,
	TResetPasswordRequest,
} from "../types/auth.type";

export function Login(
	requestBody: TLoginRequest,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.AUTH}/login`, requestBody);
}

export function Register(
	requestBody: TRegisterRequest,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.AUTH}/register`, requestBody);
}

export function ActivateAccount(
	key: string,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.get(`${endpoints.AUTH}/activate?key=${encodeURIComponent(key)}`);
}

export function GetUserProfile(): Promise<
	AxiosResponse<ApiResponse<any>, any>
> {
	return api.get(`${endpoints.ACCOUNT}/profile`);
}

export function RequestPasswordReset(
	email: string,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(
		`${endpoints.AUTH}/reset-password/init?email=${encodeURIComponent(email)}`,
	);
}

export function VerifyResetKey(
	key: string,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.get(
		`${endpoints.AUTH}/reset-password/verify?key=${encodeURIComponent(key)}`,
	);
}

export function FinishPasswordReset(
	requestBody: TResetPasswordRequest,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.AUTH}/reset-password/finish`, requestBody);
}

export function ChangePassword(
	requestBody: TChangePasswordRequest,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.ACCOUNT}/change-password`, requestBody);
}

export function Logout(): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.AUTH}/logout`);
}

export function GoogleOAuth2Login(
	code: string,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.AUTH}/oauth2/google`, { code });
}

export function GetGoogleOAuth2Config(): Promise<
	AxiosResponse<ApiResponse<any>, any>
> {
	return api.get(`${endpoints.AUTH}/oauth2/google/config`);
}

export function GitHubOAuth2Login(
	code: string,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.AUTH}/oauth2/github`, { code });
}

export function GetGitHubOAuth2Config(): Promise<
	AxiosResponse<ApiResponse<any>, any>
> {
	return api.get(`${endpoints.AUTH}/oauth2/github/config`);
}

// MFA API Functions
export function Enable2FA(): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.AUTH}/2fa/enable`);
}

export function Verify2FA(requestBody: {
	totpCode: string;
}): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.AUTH}/2fa/verify`, requestBody);
}

export function Disable2FA(): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.delete(`${endpoints.AUTH}/2fa/disable`);
}

export function LoginWith2FA(requestBody: {
	email: string;
	password: string;
	totpCode: string;
}): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.AUTH}/login/2fa`, requestBody);
}

export function Complete2FA(requestBody: {
	email: string;
	totpCode: string;
}): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.AUTH}/2fa/complete`, requestBody);
}

// QR Code Login API Functions
export function GenerateQRToken(): Promise<
	AxiosResponse<ApiResponse<{ qrToken: string }>, any>
> {
	return api.get(`${endpoints.AUTH}/qr/generate`);
}
