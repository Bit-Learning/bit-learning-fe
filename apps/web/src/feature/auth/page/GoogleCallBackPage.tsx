import { useGoogleLogin } from "@/feature/auth/queries/useAuth";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import AuthCallbackPageContent from "../component/AuthCallbackPageContent";

function GoogleCallbackPage() {
	const navigate = useNavigate();
	const { mutate: googleLogin, isError, error } = useGoogleLogin();
	const [localError, setLocalError] = React.useState<string | null>(null);

	React.useEffect(() => {
		const handleCallback = async () => {
			try {
				const urlParams = new URLSearchParams(window.location.search);
				const code = urlParams.get("code");
				const errorParam = urlParams.get("error");

				if (errorParam) {
					setLocalError("Đăng nhập bị hủy bỏ hoặc không thành công");
					setTimeout(() => navigate({ to: "/signin" }), 3000);
					return;
				}

				if (!code) {
					setLocalError("Không tìm thấy mã xác thực từ Google");
					setTimeout(() => navigate({ to: "/signin" }), 3000);
					return;
				}

				googleLogin(code, {
					onSuccess: () => {
						navigate({ to: "/" });
					},
					onError: (err: any) => {
						const errorMessage =
							err?.response?.data?.message || "Đăng nhập thất bại";
						setLocalError(errorMessage);
						setTimeout(() => navigate({ to: "/signin" }), 3000);
					},
				});
			} catch (err: any) {
				console.error("Google OAuth callback error:", err);
				setLocalError("Có lỗi xảy ra trong quá trình đăng nhập");
				setTimeout(() => navigate({ to: "/signin" }), 3000);
			}
		};

		handleCallback();
	}, [googleLogin, navigate]);

	const hasError = isError || localError;

	return AuthCallbackPageContent({ hasError, localError, error });
}

export default GoogleCallbackPage;
