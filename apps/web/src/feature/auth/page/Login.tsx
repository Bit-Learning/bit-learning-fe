import PageMeta from "@/shared/components/seo/page-meta";
import SignInForm from "../component/SigninForm";
import AuthLayout from "../layout/AuthLayout";

const SignInPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Đăng Nhập - Bithub"
				description="Đăng nhập vào tài khoản Bithub để truy cập các khóa học và dịch vụ công nghệ"
			/>
			<AuthLayout>
				<SignInForm />
			</AuthLayout>
		</>
	);
};

export default SignInPage;
