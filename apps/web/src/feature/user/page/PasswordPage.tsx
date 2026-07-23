import PageMeta from "@/shared/components/seo/page-meta";
import UserProfileLayout from "../layouts/UserProfileLayout";
import { PasswordContent } from "../components/PasswordContent";

export const PasswordPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Đổi mật khẩu - Bit Learning"
				description="Thay đổi mật khẩu tài khoản của bạn"
			/>
			<UserProfileLayout>
				<PasswordContent />
			</UserProfileLayout>
		</>
	);
};
