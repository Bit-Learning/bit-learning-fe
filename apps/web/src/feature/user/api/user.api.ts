import type { ApiResponse } from "AppModels";
import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import { endpoints } from "@/shared/constants/endpoints";
import type {
	TChangePasswordRequest,
	TUpdateUserRequest,
	TUserProfile,
	TFollowStats,
} from "../types/user.type";

export function GetUserProfile(): Promise<
	AxiosResponse<ApiResponse<TUserProfile>, any>
> {
	return api.get(`${endpoints.ACCOUNT}/profile`);
}

export function ViewUserProfile(
	userId: number,
): Promise<AxiosResponse<ApiResponse<TUserProfile>, any>> {
	return api.get(`${endpoints.ACCOUNT}/profile/view`, {
		params: { userId },
	});
}

export function ViewUserProfileByUsername(
	username: string,
): Promise<AxiosResponse<ApiResponse<TUserProfile>, any>> {
	return api.get(`${endpoints.ACCOUNT}/profile/view/${username}`);
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
): Promise<AxiosResponse<ApiResponse<TUserProfile>, any>> {
	return api.post(`${endpoints.ACCOUNT}/change-password`, requestBody);
}

export function ToggleMfa(
	enable: boolean,
): Promise<AxiosResponse<ApiResponse<TUserProfile>, any>> {
	return api.patch(`${endpoints.ACCOUNT}/mfa/toggle`, null, {
		params: { enable },
	});
}

export function DeactivateAccount(): Promise<
	AxiosResponse<ApiResponse<string>, any>
> {
	return api.patch(`${endpoints.ACCOUNT}/deactivate`);
}

export function GetInstructors(
	page = 0,
	size = 20,
): Promise<AxiosResponse<ApiResponse<any>, any>> {
	return api.get(`${endpoints.ACCOUNT}/instructors`, {
		params: { page, size },
	});
}

export function GetFollowStats(
	userId: number,
): Promise<AxiosResponse<ApiResponse<TFollowStats>, any>> {
	return api.get(`${endpoints.ACCOUNT}/${userId}/follow-stats`);
}

export function FollowUser(
	userId: number,
): Promise<AxiosResponse<ApiResponse<string>, any>> {
	return api.post(`${endpoints.ACCOUNT}/${userId}/follow`);
}

export function UnfollowUser(
	userId: number,
): Promise<AxiosResponse<ApiResponse<string>, any>> {
	return api.post(`${endpoints.ACCOUNT}/${userId}/unfollow`);
}

export function GetFollowers(
	userId: number,
	page = 0,
	size = 20,
): Promise<AxiosResponse<any, any>> {
	return api.get(`${endpoints.ACCOUNT}/${userId}/followers`, {
		params: { page, size },
	});
}

export function GetFollowing(
	userId: number,
	page = 0,
	size = 20,
): Promise<AxiosResponse<any, any>> {
	return api.get(`${endpoints.ACCOUNT}/${userId}/following`, {
		params: { page, size },
	});
}
