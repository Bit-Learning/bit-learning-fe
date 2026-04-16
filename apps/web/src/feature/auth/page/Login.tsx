import PageMeta from "@/shared/components/seo/page-meta";
import UnifiedLoginPage from "./UnifiedLogin";

const SignInPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Đăng Nhập - Bit Learning"
				description="Đăng nhập vào tài khoản Bit Learning để truy cập các khóa học và dịch vụ công nghệ"
			/>
			<UnifiedLoginPage defaultRole="STUDENT" />
		</>
	);
};

export default SignInPage;
