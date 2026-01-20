import PageMeta from "@/shared/components/seo/page-meta";
import CreateQuestionForm from "../components/QuestionFormContent";

const CreateQuestionPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Tạo câu hỏi - Bit Learning" description="Tạo câu hỏi mới" />
      <CreateQuestionForm />
    </>
  );
};

export default CreateQuestionPage;
