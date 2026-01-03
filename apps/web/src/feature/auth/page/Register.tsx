import PageMeta from "@/shared/components/seo/page-meta";
import SignUpForm from "../component/SignUpForm";
import AuthLayout from "../layout/AuthLayout";

const SignUpPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Đăng Ký - Bithub"
				description="Đăng ký tài khoản Bithub để truy cập các khóa học và dịch vụ công nghệ"
			/>
			<AuthLayout>
				<SignUpForm />
			</AuthLayout>
		</>
	);
};

export default SignUpPage;
