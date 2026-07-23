import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import { ContestLayout } from "../layouts/ContestLayout";
import { ContestInfoContent } from "../components/ContestInfoContent";

const ContestInfoPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Danh sách bài tập - Cuộc thi lập trình"
				description="Xem và làm bài tập trong cuộc thi lập trình. Nộp code và theo dõi kết quả chấm bài tự động."
			/>
			<ContestLayout>
				<ContestInfoContent />
			</ContestLayout>
		</>
	);
};

export default ContestInfoPage;
