import PageMeta from "@/shared/components/seo/page-meta";
import ForgotPasswordForm from "../component/ForgotPasswordForm";
import AuthLayout from "../layout/AuthLayout";

const ForgotPasswordPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Quên Mật Khẩu - Công ty Bit Learning"
				description="Quên Mật Khẩu - Công ty Bit Learning"
			/>
			<AuthLayout>
				<ForgotPasswordForm />
			</AuthLayout>
		</>
	);
};
export default ForgotPasswordPage;
