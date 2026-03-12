import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import { clearAuthTokens, setAuthTokens } from "@/shared/lib/cookies";
import { useAppDispatch } from "@/shared/redux/store";
import {
	ActivateAccount,
	FinishPasswordReset,
	GitHubOAuth2Login,
	GoogleOAuth2Login,
	Login,
	Logout,
	Register,
	RequestPasswordReset,
	VerifyResetKey,
} from "../api/auth.api";
import {
	setErrorAction,
	setIsAuthenticatedAction,
	setIsLoadingAction,
	setUserInfoAction,
} from "../store";
import type {
	TLoginRequest,
	TRegisterRequest,
	TResetPasswordRequest,
} from "../types/auth.type";

export const authQueryKeys = {
	all: ["auth"] as const,
	profile: () => [...authQueryKeys.all, "profile"] as const,
};

export function useLogin(options?: {
	on2FARequired?: (email: string) => void;
}) {
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: TLoginRequest) => {
			const response = await Login(credentials);
			return response.data.data as any;
		},
		onMutate: () => {
			dispatch(setIsLoadingAction(true));
			dispatch(setErrorAction(null));
		},
		onSuccess: (data: any) => {
			// Check if 2FA is required
			if (data.requires2FA) {
				// Call the callback to show 2FA form
				options?.on2FARequired?.(data.email);
				dispatch(setIsLoadingAction(false));
				return;
			}

			// Normal login flow
			setAuthTokens(data.accessToken, data.refreshToken);
			dispatch(setIsAuthenticatedAction(true));
			dispatch(setUserInfoAction(data.user));
			queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });
			toast.success({
				title: "Đăng nhập thành công",
			});
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				"Đăng nhập không thành công";

			dispatch(setErrorAction(errorMessage));

			const statusCode = error?.response?.status;

			if (statusCode === 401) {
				const needsActivation = errorMessage
					.toLowerCase()
					.includes("not activated");
				if (needsActivation) {
					toast.warning({
						title: "Tài khoản chưa kích hoạt",
						description: errorMessage,
					});
				} else {
					toast.error({
						title: "Đăng nhập thất bại",
						description: "Email hoặc mật khẩu không đúng",
					});
				}
			} else if (statusCode === 403) {
				toast.error({
					title: "Không có quyền truy cập",
					description: "Bạn không có quyền đăng nhập với vai trò này.",
				});
			} else {
				toast.error({
					title: "Đăng nhập thất bại",
					description: errorMessage,
				});
			}
		},
		onSettled: () => {
			dispatch(setIsLoadingAction(false));
		},
	});
}

export function useRegister() {
	const dispatch = useAppDispatch();

	return useMutation({
		mutationFn: async (data: TRegisterRequest) => {
			const response = await Register(data);
			return response.data;
		},
		onMutate: () => {
			dispatch(setIsLoadingAction(true));
			dispatch(setErrorAction(null));
		},
		onSuccess: (data) => {
			toast.success({
				title: "Đăng ký thành công!",
				description:
					data.message ||
					"Vui lòng kiểm tra email để kích hoạt tài khoản của bạn.",
			});
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.Message ||
				error?.response?.data?.message ||
				error.message ||
				"Đăng ký thất bại";

			dispatch(setErrorAction(errorMessage));

			toast.error({
				title: "Đăng ký thất bại",
				description: errorMessage,
			});
		},
		onSettled: () => {
			dispatch(setIsLoadingAction(false));
		},
	});
}

export function useActivateAccount() {
	const dispatch = useAppDispatch();

	return useMutation({
		mutationFn: async (key: string) => {
			const response = await ActivateAccount(key);
			return response.data;
		},
		onMutate: () => {
			dispatch(setIsLoadingAction(true));
			dispatch(setErrorAction(null));
		},
		onSuccess: (data) => {
			toast.success({
				title: "Kích hoạt tài khoản thành công!",
				description: data.message || "Bạn có thể đăng nhập ngay bây giờ.",
			});
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.message ||
				"Kích hoạt tài khoản thất bại. Liên kết có thể đã hết hạn hoặc không hợp lệ.";

			dispatch(setErrorAction(errorMessage));

			toast.error({
				title: "Kích hoạt thất bại",
				description: errorMessage,
			});
		},
		onSettled: () => {
			dispatch(setIsLoadingAction(false));
		},
	});
}

export function useForgotPassword() {
	const dispatch = useAppDispatch();

	return useMutation({
		mutationFn: async (email: string) => {
			const response = await RequestPasswordReset(email);
			return response.data;
		},
		onMutate: () => {
			dispatch(setIsLoadingAction(true));
		},
		onSuccess: (data) => {
			toast.success({
				title: "Email đã được gửi",
				description:
					data.message || "Vui lòng kiểm tra email để đặt lại mật khẩu.",
			});
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				"Không thể gửi email đặt lại mật khẩu";

			toast.error({
				title: "Gửi email thất bại",
				description: errorMessage,
			});
		},
		onSettled: () => {
			dispatch(setIsLoadingAction(false));
		},
	});
}

export function useVerifyResetKey() {
	const dispatch = useAppDispatch();

	return useMutation({
		mutationFn: async (key: string) => {
			const response = await VerifyResetKey(key);
			return response.data;
		},
		onMutate: () => {
			dispatch(setIsLoadingAction(true));
		},
		onSuccess: (data) => {
			console.log("Reset key verified successfully:", data);
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.message ||
				"Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn";

			dispatch(setErrorAction(errorMessage));
		},
		onSettled: () => {
			dispatch(setIsLoadingAction(false));
		},
	});
}

export function useResetPassword() {
	const dispatch = useAppDispatch();

	return useMutation({
		mutationFn: async (data: TResetPasswordRequest) => {
			const response = await FinishPasswordReset(data);
			return response.data;
		},
		onMutate: () => {
			dispatch(setIsLoadingAction(true));
		},
		onSuccess: (data) => {
			toast.success({
				title: "Đặt lại mật khẩu thành công",
				description: data.message || "Bạn có thể đăng nhập với mật khẩu mới.",
			});
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.message || "Đặt lại mật khẩu thất bại";

			toast.error({
				title: "Đặt lại mật khẩu thất bại",
				description: errorMessage,
			});
		},
		onSettled: () => {
			dispatch(setIsLoadingAction(false));
		},
	});
}

export function useLogout() {
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	return async () => {
		try {
			// Call backend to invalidate session and clear HttpOnly refresh token cookie
			await Logout();
		} catch (error) {
			console.error("Logout API error:", error);
			// Continue with local cleanup even if API call fails
		} finally {
			// Always clear local auth state
			clearAuthTokens();
			dispatch(setIsAuthenticatedAction(false));
			dispatch(setUserInfoAction(null));
			dispatch(setErrorAction(null));
			queryClient.clear();
			toast.info({
				title: "Đăng xuất thành công",
				description: "Hẹn gặp lại bạn!",
			});
		}
	};
}

export function useGoogleLogin() {
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (code: string) => {
			const response = await GoogleOAuth2Login(code);
			return response.data.data;
		},
		onMutate: () => {
			dispatch(setIsLoadingAction(true));
		},
		onSuccess: (data: any) => {
			setAuthTokens(data.accessToken, data.refreshToken);
			dispatch(setIsAuthenticatedAction(true));
			dispatch(setUserInfoAction(data.user));
			queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });

			if (data.isNewUser) {
				toast.success({
					title: "Đăng nhập thành công!",
					description: `Chào mừng ${data.user.username || "bạn"} đến với Bit Learning! ${data.message || "Vui lòng kiểm tra email để lấy mật khẩu tạm thời."}`,
				});
			} else {
				toast.success({
					title: "Đăng nhập thành công",
					description: `Chào mừng ${data.user.username || "bạn"} trở lại!`,
				});
			}
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.message ||
				"Đăng nhập với Google không thành công";
			dispatch(setErrorAction(errorMessage));

			toast.error({
				title: "Đăng nhập thất bại",
				description: errorMessage,
			});
		},
		onSettled: () => {
			dispatch(setIsLoadingAction(false));
		},
	});
}

export function useGitHubLogin() {
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (code: string) => {
			const response = await GitHubOAuth2Login(code);
			return response.data.data;
		},
		onMutate: () => {
			dispatch(setIsLoadingAction(true));
		},
		onSuccess: (data: any) => {
			setAuthTokens(data.accessToken, data.refreshToken);
			dispatch(setIsAuthenticatedAction(true));
			dispatch(setUserInfoAction(data.user));
			queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });

			if (data.isNewUser) {
				toast.success({
					title: "Đăng nhập thành công!",
					description: `Chào mừng ${data.user.username || "bạn"} đến với Bit Learning! ${data.message || "Vui lòng kiểm tra email để lấy mật khẩu tạm thời."}`,
				});
			} else {
				toast.success({
					title: "Đăng nhập thành công",
					description: `Chào mừng ${data.user.username || "bạn"} trở lại!`,
				});
			}
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.message ||
				"Đăng nhập với GitHub không thành công";
			dispatch(setErrorAction(errorMessage));

			toast.error({
				title: "Đăng nhập thất bại",
				description: errorMessage,
			});
		},
		onSettled: () => {
			dispatch(setIsLoadingAction(false));
		},
	});
}
