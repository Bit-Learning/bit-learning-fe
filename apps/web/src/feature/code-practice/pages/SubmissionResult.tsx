import PageMeta from "@/shared/components/seo/page-meta";
import SubmissionResultContent from "../components/SubmissionResultContent";

export const StudentProblemListPage: React.FC = () => (
	<>
		<PageMeta
			title="Submission Results - Bit Learning"
			description="Xem kết quả nộp bài và đánh giá chi tiết cho các bài tập lập trình trên Bit Learning."
		/>
		<SubmissionResultContent />
	</>
);
