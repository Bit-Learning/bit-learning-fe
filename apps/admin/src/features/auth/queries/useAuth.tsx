import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { setAuthTokens } from "@/shared/lib/cookies";
import { useAuthStore } from "@/shared/stores/auth-store";
import { AdminLogin } from "../api/auth.api";
import { TAdminLoginRequest, TUserRole } from "../types/auth.types";

export const authQueryKeys = {
	all: ["auth"] as const,
	profile: () => [...authQueryKeys.all, "profile"] as const,
	session: () => [...authQueryKeys.all, "session"] as const,
};

interface UseLoginOptions {
	redirectTo?: string;
	on2FARequired?: (email: string) => void;
}

export function useLogin(options: UseLoginOptions = {}) {
	const { redirectTo = "/", on2FARequired } = options;
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { auth } = useAuthStore();

	const allowedAdminRoles: TUserRole[] = ["ADMIN", "MANAGER"];

	return useMutation({
		mutationFn: (data: TAdminLoginRequest) =>
			AdminLogin(data).then((res) => res.data.data),
		onSuccess: (data: any) => {
			if (data.requires2FA) {
				on2FARequired?.(data.email);
				return;
			}

			const { accessToken, refreshToken, user } = data;

			// Chỉ cho phép ADMIN hoặc MANAGER truy cập trang admin
			if (!allowedAdminRoles.includes(user.role as TUserRole)) {
				toast.error(
					"Tài khoản của bạn không có quyền truy cập trang quản trị.",
				);
				return;
			}

			setAuthTokens(accessToken, refreshToken);
			auth.setAccessToken(accessToken);
			auth.setRefreshToken(refreshToken);
			auth.setUser({
				accountNo: user.id.toString(),
				email: user.email,
				role: [user.role], // Will be ["ADMIN"] or ["MANAGER"]
				exp: Date.now() + 24 * 60 * 60 * 1000,
				firstName: user.firstName,
				lastName: user.lastName,
				avatar: user.avatar,
			});

			queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });

			// ✅ FIX: More friendly welcome message
			const roleText = user.role === "ADMIN" ? "Quản trị viên" : "Nhà quản lý";
			toast.success(`Chào mừng ${roleText} ${user.firstName}!`);

			navigate({ to: redirectTo, replace: true });
		},
		onError: (error: any) => {
			const errorMessage =
				error?.response?.data?.message || error?.response?.data?.error;
			const statusCode = error?.response?.status;

			if (statusCode === 401) {
				if (errorMessage?.toLowerCase().includes("not activated")) {
					toast.error(
						"Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.",
					);
				} else {
					toast.error("Email hoặc mật khẩu không đúng.");
				}
			} else if (statusCode === 403) {
				toast.error(
					"Truy cập bị từ chối. Chỉ quản trị viên và nhà quản lý mới có quyền truy cập.",
				);
			} else {
				toast.error(errorMessage || "Đăng nhập thất bại. Vui lòng thử lại.");
			}
		},
	});
}

export function useLogout() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { auth } = useAuthStore();

	const logout = () => {
		auth.reset();
		queryClient.clear();
		toast.success("Đăng xuất thành công");
		navigate({ to: "/sign-in", replace: true });
	};

	return { logout };
}

interface UseBypassLoginOptions {
	redirectTo?: string;
	role?: "ADMIN" | "MANAGER"; // ✅ Allow choosing role for bypass
}

export function useBypassLogin(options: UseBypassLoginOptions = {}) {
	const { redirectTo = "/", role = "ADMIN" } = options;
	const navigate = useNavigate();
	const { auth } = useAuthStore();

	const bypassLogin = () => {
		const fakeAccessToken = `fake-access-token-${Date.now()}`;
		const fakeRefreshToken = `fake-refresh-token-${Date.now()}`;

		setAuthTokens(fakeAccessToken, fakeRefreshToken);
		auth.setAccessToken(fakeAccessToken);
		auth.setRefreshToken(fakeRefreshToken);
		auth.setUser({
			accountNo: "1",
			email: role === "ADMIN" ? "admin@example.com" : "manager@example.com",
			role: [role],
			exp: Date.now() + 24 * 60 * 60 * 1000,
			firstName: role === "ADMIN" ? "Admin" : "Manager",
			lastName: "User",
			avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
		});

		const roleText = role === "ADMIN" ? "Quản trị viên" : "Nhà quản lý";
		toast.success(`🚀 Bypass thành công - Chào ${roleText}!`);
		navigate({ to: redirectTo, replace: true });
	};

	return { bypassLogin };
}
