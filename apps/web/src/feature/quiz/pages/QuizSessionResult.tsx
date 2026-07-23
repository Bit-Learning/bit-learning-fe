import React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import PracticeResultContent from "../components/PracticeResultContent";

const QuizSessionResultPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Kết quả luyện tập - Bit Learning"
				description="Xem chi tiết kết quả và phân tích bài luyện tập"
			/>
			<PracticeResultContent />
		</>
	);
};

export default QuizSessionResultPage;
