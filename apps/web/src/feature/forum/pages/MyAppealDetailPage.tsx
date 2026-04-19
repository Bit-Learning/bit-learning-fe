import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import MyAppealDetailContent from "../components/MyAppealDetailContent";

const MyAppealDetailPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Chi tiết khiếu nại - Bit Learning"
				description="Xem chi tiết ticket khiếu nại và trao đổi với quản trị viên trên diễn đàn Bit Learning"
			/>
			<MyAppealDetailContent />
		</>
	);
};

export default MyAppealDetailPage;
