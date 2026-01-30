import PageMeta from "@/shared/components/seo/page-meta";
import QuestionFormContent from "../components/QuestionFormContent";

const EditQuestionPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Chỉnh sửa câu hỏi - Bit Learning" description="Chỉnh sửa thông tin câu hỏi" />
      <QuestionFormContent mode="edit" />
    </>
  );
};

export default EditQuestionPage;
