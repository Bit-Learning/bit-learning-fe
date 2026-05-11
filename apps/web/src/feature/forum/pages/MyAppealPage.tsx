import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import MyAppealContent from "../components/MyAppealContent";

const MyAppealPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Khiếu nại của tôi - Bit Learning"
				description="Theo dõi các ticket khiếu nại bài viết của bạn trên diễn đàn Bit Learning"
			/>
			<MyAppealContent />
		</>
	);
};

export default MyAppealPage;
