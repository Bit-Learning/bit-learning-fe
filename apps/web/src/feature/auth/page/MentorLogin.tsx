import PageMeta from "@/shared/components/seo/page-meta";
import AuthLayout from "../layout/AuthLayout";
import MentorSigninForm from "../component/MentorSigninForm";

const MentorSignInPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Đăng Nhập Mentor - Bit Learning"
				description="Đăng nhập vào tài khoản Mentor để quản lý khóa học và học viên"
			/>
			<AuthLayout backgroundImageUrl="/auth-mentor.jpg">
				<MentorSigninForm />
			</AuthLayout>
		</>
	);
};

export default MentorSignInPage;
