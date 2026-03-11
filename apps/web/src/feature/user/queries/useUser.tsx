import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import { useEffect } from "react";
import { setIsLoadingAction } from "@/feature/app/stores";
import { setErrorAction, setIsAuthenticatedAction, setUserInfoAction } from "@/feature/auth/store";
import { getAccessToken } from "@/shared/lib/cookies";
import { useAppDispatch } from "@/shared/redux/store";
import { ChangePassword, GetUserProfile, UpdateUserProfile, UploadAvatar, UploadCoverImage } from "../api/user.api";
import type { TChangePasswordRequest, TUpdateUserRequest } from "../types/user.type";

export const userQueryKeys = {
  all: ["profile"] as const,
};

export function useUserProfile() {
  const dispatch = useAppDispatch();

  const query = useQuery({
    queryKey: userQueryKeys.all,
    queryFn: async () => {
      const response = await GetUserProfile();
      return response.data.data;
    },
    enabled: !!getAccessToken(),
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      dispatch(setUserInfoAction(query.data));
      dispatch(setIsAuthenticatedAction(true));
    }
  }, [query.isSuccess, query.data, dispatch]);

  useEffect(() => {
    if (query.isError && query.error) {
      const error = query.error as any;
      const errorMessage = error?.response?.data?.message || "";
      dispatch(setErrorAction(errorMessage));

      if (error?.response?.status !== 401) {
        dispatch(setIsAuthenticatedAction(false));
        dispatch(setUserInfoAction(null));
      }
    }
  }, [query.isError, query.error, dispatch]);

  return query;
}

export function useInitializeAuth() {
  const { refetch } = useUserProfile();

  return () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      refetch();
    }
  };
}

export function useChangePassword() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: TChangePasswordRequest) => {
      const response = await ChangePassword(data);
      return response.data;
    },
    onMutate: () => {
      dispatch(setIsLoadingAction(true));
    },
    onSuccess: (data) => {
      toast.success({
        title: "Đổi mật khẩu thành công",
        description: data.message || "Mật khẩu của bạn đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Đổi mật khẩu thất bại";

      dispatch(setErrorAction(errorMessage));

      toast.error({
        title: "Đổi mật khẩu thất bại",
        description: errorMessage,
      });
    },
    onSettled: () => {
      dispatch(setIsLoadingAction(false));
    },
  });
}

export function useUpdateUserProfile() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TUpdateUserRequest) => {
      const response = await UpdateUserProfile(data);
      return response.data;
    },
    onMutate: () => {
      dispatch(setIsLoadingAction(true));
    },
    onSuccess: (data) => {
      // Update both cache and redux store
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      dispatch(setUserInfoAction(data.data));

      toast.success({
        title: "Cập nhật hồ sơ thành công",
        description: data.message || "Thông tin của bạn đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Cập nhật hồ sơ thất bại";

      dispatch(setErrorAction(errorMessage));

      toast.error({
        title: "Cập nhật hồ sơ thất bại",
        description: errorMessage,
      });
    },
    onSettled: () => {
      dispatch(setIsLoadingAction(false));
    },
  });
}

export function useUploadAvatar() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarFile: File) => {
      const response = await UploadAvatar(avatarFile);
      return response.data;
    },
    onMutate: () => {
      dispatch(setIsLoadingAction(true));
    },
    onSuccess: (data) => {
      // Refetch user profile to get updated avatar
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });

      toast.success({
        title: "Tải ảnh đại diện thành công",
        description: data.message || "Ảnh đại diện của bạn đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Tải ảnh đại diện thất bại";

      dispatch(setErrorAction(errorMessage));

      toast.error({
        title: "Tải ảnh đại diện thất bại",
        description: errorMessage,
      });
    },
    onSettled: () => {
      dispatch(setIsLoadingAction(false));
    },
  });
}

export function useUploadCoverImage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coverFile: File) => {
      const response = await UploadCoverImage(coverFile);
      return response.data;
    },
    onMutate: () => {
      dispatch(setIsLoadingAction(true));
    },
    onSuccess: (data) => {
      // Refetch user profile to get updated cover image
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });

      toast.success({
        title: "Tải ảnh bìa thành công",
        description: data.message || "Ảnh bìa của bạn đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Tải ảnh bìa thất bại";

      dispatch(setErrorAction(errorMessage));

      toast.error({
        title: "Tải ảnh bìa thất bại",
        description: errorMessage,
      });
    },
    onSettled: () => {
      dispatch(setIsLoadingAction(false));
    },
  });
}
