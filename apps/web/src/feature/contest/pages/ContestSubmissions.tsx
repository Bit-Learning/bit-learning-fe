import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import ContestSubmissionsContent from "../components/ContestSubmissionsContent";
import { ContestLayout } from "../layouts/ContestLayout";

const ContestSubmissionsPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Bài nộp của tôi - Cuộc thi lập trình"
				description="Xem lịch sử bài nộp và kết quả chấm của bạn trong cuộc thi."
			/>
			<ContestLayout>
				<ContestSubmissionsContent />
			</ContestLayout>
		</>
	);
};

export default ContestSubmissionsPage;
