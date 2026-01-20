import PageMeta from "@/shared/components/seo/page-meta";
import QuestionListContent from "../components/QuestionListContent";

const QuestionListPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Danh sách câu hỏi - Bit Learning" description="Quản lý danh sách câu hỏi" />
      <QuestionListContent />
    </>
  );
};

export default QuestionListPage;
