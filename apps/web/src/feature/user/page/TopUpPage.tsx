import PageMeta from "@/shared/components/seo/page-meta";
import UserProfileLayout from "../layouts/UserProfileLayout";
import { TopUpContent } from "../components/TopUpContent";

export const TopUpPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Nạp tiền - Bit Learning"
				description="Nạp tiền vào ví của bạn để sử dụng các dịch vụ"
			/>
			<UserProfileLayout>
				<div className="container mx-auto">
					<TopUpContent />
				</div>
			</UserProfileLayout>
		</>
	);
};
