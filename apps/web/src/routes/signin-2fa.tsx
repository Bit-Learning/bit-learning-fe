import { createFileRoute } from "@tanstack/react-router";
import LoginWith2FAForm from "@/feature/auth/component/LoginWith2FA";
import AuthLayout from "@/feature/auth/layout/AuthLayout";
import PageMeta from "@/shared/components/seo/page-meta";

export const Route = createFileRoute("/signin-2fa")({
	component: SignIn2FAPage,
});

function SignIn2FAPage() {
	return (
		<>
			<PageMeta
				title="Đăng Nhập 2FA - Bithub"
				description="Đăng nhập với xác thực hai yếu tố vào tài khoản Bithub"
			/>
			<AuthLayout>
				<LoginWith2FAForm />
			</AuthLayout>
		</>
	);
}
