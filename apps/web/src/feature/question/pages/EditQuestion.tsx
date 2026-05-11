import PageMeta from "@/shared/components/seo/page-meta";
import QuestionFormContent from "../components/QuestionFormContent";
import MentorLayout from "@/layouts/mentor-layout";

const EditQuestionPage: React.FC = () => {
	return (
		<>
			<PageMeta
				title="Chỉnh sửa câu hỏi - Bit Learning"
				description="Chỉnh sửa thông tin câu hỏi"
			/>
			<MentorLayout>
				<div className="min-h-screen bg-white dark:bg-slate-950">
					<QuestionFormContent mode="edit" />
				</div>
			</MentorLayout>
		</>
	);
};

export default EditQuestionPage;
