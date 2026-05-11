import PageMeta from "@/shared/components/seo/page-meta";
import UnifiedLoginPage from "./UnifiedLogin";

const MentorSignInPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Đăng Nhập Mentor - Bit Learning"
				description="Đăng nhập vào tài khoản Mentor để quản lý khóa học và học viên"
			/>
			<UnifiedLoginPage defaultRole="MENTOR" />
		</>
	);
};

export default MentorSignInPage;
