import PageMeta from "@/shared/components/seo/page-meta";
import React from "react";
import UserProfileLayout from "../layouts/UserProfileLayout";
import TransactionHistoryContent from "../components/TransactionHistoryContent";

export const TransactionHistoryPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Lịch sử giao dịch - Bit Learning"
				description="Xem lại toàn bộ lịch sử giao dịch của bạn"
			/>
			<UserProfileLayout>
				<div className="flex-1 w-full">
					<TransactionHistoryContent />
				</div>
			</UserProfileLayout>
		</>
	);
};
