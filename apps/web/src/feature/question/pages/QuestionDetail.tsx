import PageMeta from "@/shared/components/seo/page-meta";
import QuestionDetailContent from "../components/QuestionDetailContent";

const QuestionDetailPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Chi tiết câu hỏi - Bit Learning" description="Xem chi tiết thông tin câu hỏi" />
      <QuestionDetailContent />
    </>
  );
};

export default QuestionDetailPage;
