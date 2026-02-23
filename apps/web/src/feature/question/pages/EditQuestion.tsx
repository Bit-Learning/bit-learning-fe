import PageMeta from "@/shared/components/seo/page-meta";
import QuestionFormContent from "../components/QuestionFormContent";
import MentorLayout from "@/layouts/mentor-layout";

const EditQuestionPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Chỉnh sửa câu hỏi - Bit Learning" description="Chỉnh sửa thông tin câu hỏi" />
      <MentorLayout>
        <div>
          <QuestionFormContent mode="edit" />
        </div>
      </MentorLayout>
    </>
  );
};

export default EditQuestionPage;
