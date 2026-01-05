import type { ApiResponse } from "AppModels";
import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import { endpoints } from "@/shared/constants/endpoints";
import type {
	TChangePasswordRequest,
	TUpdateUserRequest,
	TUserProfile,
} from "../types/user.type";

export function GetUserProfile(): Promise<
	AxiosResponse<ApiResponse<TUserProfile>, any>
> {
	return api.get(`${endpoints.ACCOUNT}/profile`);
}

export function UpdateUserProfile(
	requestBody: TUpdateUserRequest,
): Promise<AxiosResponse<ApiResponse<TUserProfile>, any>> {
	return api.patch(`${endpoints.ACCOUNT}/profile`, requestBody);
}

export function UploadAvatar(
	avatarFile: File,
): Promise<AxiosResponse<ApiResponse<string>, any>> {
	const formData = new FormData();
	formData.append("avatar", avatarFile);
	return api.post(`${endpoints.ACCOUNT}/${0}/avatar`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
}

export function UploadCoverImage(
	coverFile: File,
): Promise<AxiosResponse<ApiResponse<string>, any>> {
	const formData = new FormData();
	formData.append("cover", coverFile);
	return api.post(`${endpoints.ACCOUNT}/${0}/cover`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
}

export function ChangePassword(
	requestBody: TChangePasswordRequest,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.post(`${endpoints.ACCOUNT}/change-password`, requestBody);
}
