import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { endpoints } from "@/shared/constants/endpoints";
import type { TChangePasswordRequest, TUpdateUserRequest, TUserProfile, TFollowStats } from "../types/user.type";

export const userApi = {
  getProfile(): Promise<AxiosResponse<ApiResponse<TUserProfile>>> {
    return api.get(`${endpoints.ACCOUNT}/profile`);
  },

  viewProfile(userId: number): Promise<AxiosResponse<ApiResponse<TUserProfile>>> {
    return api.get(`${endpoints.ACCOUNT}/profile/view`, {
      params: { userId },
    });
  },

  viewProfileByUsername(username: string): Promise<AxiosResponse<ApiResponse<TUserProfile>>> {
    return api.get(`${endpoints.ACCOUNT}/profile/view/${username}`);
  },

  updateProfile(requestBody: TUpdateUserRequest): Promise<AxiosResponse<ApiResponse<TUserProfile>>> {
    return api.patch(`${endpoints.ACCOUNT}/profile`, requestBody);
  },

  uploadAvatar(avatarFile: File): Promise<AxiosResponse<ApiResponse<string>>> {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    return api.post(`${endpoints.ACCOUNT}/${0}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadCoverImage(coverFile: File): Promise<AxiosResponse<ApiResponse<string>>> {
    const formData = new FormData();
    formData.append("cover", coverFile);
    return api.post(`${endpoints.ACCOUNT}/${0}/cover`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  changePassword(requestBody: TChangePasswordRequest): Promise<AxiosResponse<ApiResponse<TUserProfile>>> {
    return api.post(`${endpoints.ACCOUNT}/change-password`, requestBody);
  },

  toggleMfa(enable: boolean): Promise<AxiosResponse<ApiResponse<TUserProfile>>> {
    return api.patch(`${endpoints.ACCOUNT}/mfa/toggle`, null, {
      params: { enable },
    });
  },

  deactivateAccount(): Promise<AxiosResponse<ApiResponse<string>>> {
    return api.patch(`${endpoints.ACCOUNT}/deactivate`);
  },

  getInstructors(page = 0, size = 20): Promise<AxiosResponse<ApiResponse<any>>> {
    return api.get(`${endpoints.ACCOUNT}/instructors`, {
      params: { page, size },
    });
  },

  getFollowStats(userId: number): Promise<AxiosResponse<ApiResponse<TFollowStats>>> {
    return api.get(`${endpoints.ACCOUNT}/${userId}/follow-stats`);
  },

  followUser(userId: number): Promise<AxiosResponse<ApiResponse<string>>> {
    return api.post(`${endpoints.ACCOUNT}/${userId}/follow`);
  },

  unfollowUser(userId: number): Promise<AxiosResponse<ApiResponse<string>>> {
    return api.post(`${endpoints.ACCOUNT}/${userId}/unfollow`);
  },

  getFollowers(userId: number, page = 0, size = 20): Promise<AxiosResponse<any>> {
    return api.get(`${endpoints.ACCOUNT}/${userId}/followers`, {
      params: { page, size },
    });
  },

  getFollowing(userId: number, page = 0, size = 20): Promise<AxiosResponse<any>> {
    return api.get(`${endpoints.ACCOUNT}/${userId}/following`, {
      params: { page, size },
    });
  },
};
