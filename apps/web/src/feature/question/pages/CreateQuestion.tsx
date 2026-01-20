import PageMeta from "@/shared/components/seo/page-meta";
import QuestionFormContent from "../components/QuestionFormContent";

const CreateQuestionPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Tạo câu hỏi - Bit Learning" description="Tạo câu hỏi mới" />
      <QuestionFormContent />
    </>
  );
};

export default CreateQuestionPage;
