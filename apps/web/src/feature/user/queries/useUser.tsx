import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "@/shared/components/Sonner";
import { setIsLoadingAction } from "@/feature/app/stores";
import { setErrorAction, setIsAuthenticatedAction, setUserInfoAction } from "@/feature/auth/store";
import { getAccessToken } from "@/shared/lib/cookies";
import { useAppDispatch } from "@/shared/redux/store";
import { userApi } from "../api/user.api";
import type { TChangePasswordRequest, TUpdateUserRequest } from "../types/user.type";

export const userQueryKeys = {
  all: ["profile"] as const,
  viewProfile: (userId: number) => ["viewProfile", userId] as const,
  viewProfileByUsername: (username: string) => ["viewProfile", "username", username] as const,
  instructors: (page: number) => ["instructors", page] as const,
  followStats: (userId: number) => ["followStats", userId] as const,
  followers: (userId: number) => ["followers", userId] as const,
  following: (userId: number) => ["following", userId] as const,
};

export function useUserProfile() {
  const dispatch = useAppDispatch();

  const query = useQuery({
    queryKey: userQueryKeys.all,
    queryFn: async () => {
      const res = await userApi.getProfile();
      return res.data.data;
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

export function useViewUserProfile(userId: number) {
  return useQuery({
    queryKey: userQueryKeys.viewProfile(userId),
    queryFn: async () => {
      const res = await userApi.viewProfile(userId);
      return res.data.data;
    },
    enabled: !!userId,
  });
}

export function useViewUserProfileByUsername(username: string) {
  return useQuery({
    queryKey: userQueryKeys.viewProfileByUsername(username),
    queryFn: async () => {
      const res = await userApi.viewProfileByUsername(username);
      return res.data.data;
    },
    enabled: !!username,
  });
}

export function useInitializeAuth() {
  const { refetch } = useUserProfile();
  return () => {
    if (getAccessToken()) refetch();
  };
}

export function useChangePassword() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: TChangePasswordRequest) => {
      const res = await userApi.changePassword(data);
      return res.data;
    },
    onMutate: () => dispatch(setIsLoadingAction(true)),
    onSuccess: (data) => {
      toast.success({
        title: "Đổi mật khẩu thành công",
        description: data.message || "Mật khẩu của bạn đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Đổi mật khẩu thất bại";
      dispatch(setErrorAction(msg));
      toast.error({ title: "Đổi mật khẩu thất bại", description: msg });
    },
    onSettled: () => dispatch(setIsLoadingAction(false)),
  });
}

export function useUpdateUserProfile() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TUpdateUserRequest) => {
      const res = await userApi.updateProfile(data);
      return res.data;
    },
    onMutate: () => dispatch(setIsLoadingAction(true)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      dispatch(setUserInfoAction(data.data));
      toast.success({
        title: "Cập nhật hồ sơ thành công",
        description: data.message || "Thông tin của bạn đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Cập nhật hồ sơ thất bại";
      dispatch(setErrorAction(msg));
      toast.error({ title: "Cập nhật hồ sơ thất bại", description: msg });
    },
    onSettled: () => dispatch(setIsLoadingAction(false)),
  });
}

export function useUploadAvatar() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarFile: File) => {
      const res = await userApi.uploadAvatar(avatarFile);
      return res.data;
    },
    onMutate: () => dispatch(setIsLoadingAction(true)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      toast.success({
        title: "Tải ảnh đại diện thành công",
        description: data.message || "Ảnh đại diện của bạn đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Tải ảnh đại diện thất bại";
      dispatch(setErrorAction(msg));
      toast.error({ title: "Tải ảnh đại diện thất bại", description: msg });
    },
    onSettled: () => dispatch(setIsLoadingAction(false)),
  });
}

export function useUploadCoverImage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coverFile: File) => {
      const res = await userApi.uploadCoverImage(coverFile);
      return res.data;
    },
    onMutate: () => dispatch(setIsLoadingAction(true)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      toast.success({
        title: "Tải ảnh bìa thành công",
        description: data.message || "Ảnh bìa của bạn đã được cập nhật.",
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Tải ảnh bìa thất bại";
      dispatch(setErrorAction(msg));
      toast.error({ title: "Tải ảnh bìa thất bại", description: msg });
    },
    onSettled: () => dispatch(setIsLoadingAction(false)),
  });
}

export function useDeactivateAccount() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async () => {
      const res = await userApi.deactivateAccount();
      return res.data;
    },
    onMutate: () => dispatch(setIsLoadingAction(true)),
    onSuccess: () => {
      toast.success({
        title: "Tài khoản đã bị vô hiệu hóa",
        description: "Tài khoản của bạn đã được vô hiệu hóa thành công.",
      });
      window.location.href = "/signin-role";
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Vô hiệu hóa tài khoản thất bại";
      dispatch(setErrorAction(msg));
      toast.error({ title: "Lỗi", description: msg });
    },
    onSettled: () => dispatch(setIsLoadingAction(false)),
  });
}

export function useInstructors(page = 0, size = 20) {
  return useQuery({
    queryKey: userQueryKeys.instructors(page),
    queryFn: async () => {
      const res = await userApi.getInstructors(page, size);
      return res.data.data;
    },
  });
}

export function useFollowStats(userId: number) {
  return useQuery({
    queryKey: userQueryKeys.followStats(userId),
    queryFn: async () => {
      const res = await userApi.getFollowStats(userId);
      return res.data.data;
    },
    enabled: !!userId,
  });
}

export function useFollowers(userId: number) {
  return useQuery({
    queryKey: userQueryKeys.followers(userId),
    queryFn: async () => {
      const res = await userApi.getFollowers(userId);
      return res.data.content;
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: number) {
  return useQuery({
    queryKey: userQueryKeys.following(userId),
    queryFn: async () => {
      const res = await userApi.getFollowing(userId);
      return res.data.content;
    },
    enabled: !!userId,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await userApi.followUser(userId);
      return res.data;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: userQueryKeys.followStats(userId) });
      const previous = queryClient.getQueryData(userQueryKeys.followStats(userId));
      queryClient.setQueryData(userQueryKeys.followStats(userId), (old: any) =>
        old ? { ...old, isFollowing: true, followersCount: (old.followersCount ?? 0) + 1 } : old,
      );
      return { previous, userId };
    },
    onError: (error: any, userId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(userQueryKeys.followStats(userId), context.previous);
      }
      toast.error({
        title: "Lỗi",
        description: error?.response?.data?.message || "Theo dõi thất bại",
      });
    },
    onSettled: (_data, _error, userId) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.followStats(userId) });
      }, 1000);
    },
    onSuccess: () => {
      toast.success({ title: "Đã theo dõi", description: "Bạn đã theo dõi người dùng này." });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await userApi.unfollowUser(userId);
      return res.data;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: userQueryKeys.followStats(userId) });
      const previous = queryClient.getQueryData(userQueryKeys.followStats(userId));
      queryClient.setQueryData(userQueryKeys.followStats(userId), (old: any) =>
        old ? { ...old, isFollowing: false, followersCount: Math.max((old.followersCount ?? 1) - 1, 0) } : old,
      );
      return { previous, userId };
    },
    onError: (error: any, userId, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(userQueryKeys.followStats(userId), context.previous);
      }
      toast.error({
        title: "Lỗi",
        description: error?.response?.data?.message || "Bỏ theo dõi thất bại",
      });
    },
    onSettled: (_data, _error, userId) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.followStats(userId) });
      }, 1000);
    },
    onSuccess: () => {
      toast.success({ title: "Đã bỏ theo dõi", description: "Bạn đã bỏ theo dõi người dùng này." });
    },
  });
}
