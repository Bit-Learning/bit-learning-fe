import PageMeta from "@/shared/components/seo/page-meta";
import QuestionFormContent from "../components/QuestionFormContent";
import MentorLayout from "@/layouts/mentor-layout";

const CreateQuestionPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Tạo câu hỏi - Bit Learning"
				description="Tạo câu hỏi mới"
			/>
			<MentorLayout>
				<div className="min-h-screen bg-white dark:bg-slate-950">
					<QuestionFormContent />
				</div>
			</MentorLayout>
		</>
	);
};

export default CreateQuestionPage;
