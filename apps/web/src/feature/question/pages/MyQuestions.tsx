import PageMeta from "@/shared/components/seo/page-meta";
import MyQuestionsContent from "../components/MyQuestionContent";

const MyQuestionsPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Danh sách câu hỏi của tôi - Bit Learning" description="Quản lý danh sách câu hỏi của tôi" />
      <MyQuestionsContent />
    </>
  );
};

export default MyQuestionsPage;
