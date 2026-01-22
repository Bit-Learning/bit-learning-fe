import PageMeta from "@/shared/components/seo/page-meta";
import GenerateExamFromQuestionsContent from "../component/GenerateExamFromQuestionsContent";

export const GenerateExamFromQuestionsPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Tạo đề thi từ câu hỏi - Bit Learning" description="Chọn câu hỏi và tạo đề thi tùy chỉnh" />
      <GenerateExamFromQuestionsContent />
    </>
  );
};
