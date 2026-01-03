import PageMeta from "@/shared/components/seo/page-meta";
import Enable2FAComponent from "../component/Enable2FA";
import AuthLayout from "../layout/AuthLayout";

const Enable2FAPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Bật Xác Thực 2FA - Bithub"
				description="Bảo vệ tài khoản của bạn với xác thực hai yếu tố"
			/>
			<AuthLayout>
				<div className="flex h-full w-full items-center justify-center p-6">
					<Enable2FAComponent />
				</div>
			</AuthLayout>
		</>
	);
};

export default Enable2FAPage;
