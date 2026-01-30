import PageMeta from "@/shared/components/seo/page-meta";
import ImportQuestionForm from "../components/ImportQuestionForm";

const ImportQuestionPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Import câu hỏi - Bit Learning"
        description="Import danh sách câu hỏi vào hệ thống Bit Learning"
      />
      <ImportQuestionForm />
    </>
  );
};

export default ImportQuestionPage;
