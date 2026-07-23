import React from "react";
import { useParams } from "@tanstack/react-router";
import PageMeta from "@/shared/components/seo/page-meta";
import QuizSessionContent from "../components/QuizSessionContent";

const QuizSessionPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Luyện tập - Bit Learning"
				description="Luyện tập không giới hạn thời gian với lời giải chi tiết"
			/>
			<QuizSessionContent />
		</>
	);
};

export default QuizSessionPage;
