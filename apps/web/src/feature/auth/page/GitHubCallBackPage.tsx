import { useGitHubLogin } from "@/feature/auth/queries/useAuth";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import AuthCallbackPageContent from "../component/AuthCallbackPageContent";

function getErrorMessage(error: unknown) {
	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		typeof error.response === "object" &&
		error.response !== null &&
		"data" in error.response &&
		typeof error.response.data === "object" &&
		error.response.data !== null &&
		"message" in error.response.data &&
		typeof error.response.data.message === "string"
	) {
		return error.response.data.message;
	}

	return "Đăng nhập thất bại";
}

function GitHubCallbackPage() {
	const navigate = useNavigate();
	const { mutate: githubLogin, isError, error } = useGitHubLogin();
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
					setLocalError("Không tìm thấy mã xác thực từ GitHub");
					setTimeout(() => navigate({ to: "/signin" }), 3000);
					return;
				}

				githubLogin(code, {
					onSuccess: () => {
						navigate({ to: "/" });
					},
					onError: (err: unknown) => {
						const errorMessage = getErrorMessage(err);
						setLocalError(errorMessage);
						setTimeout(() => navigate({ to: "/signin" }), 3000);
					},
				});
			} catch (err: unknown) {
				console.error("GitHub OAuth callback error:", err);
				setLocalError("Có lỗi xảy ra trong quá trình đăng nhập");
				setTimeout(() => navigate({ to: "/signin" }), 3000);
			}
		};

		handleCallback();
	}, [githubLogin, navigate]);

	const hasError = isError || localError;

	return (
		<AuthCallbackPageContent
			hasError={hasError}
			localError={localError}
			error={error}
			fullScreen
		/>
	);
}

export default GitHubCallbackPage;
