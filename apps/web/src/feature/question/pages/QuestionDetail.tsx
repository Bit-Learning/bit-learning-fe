import PageMeta from "@/shared/components/seo/page-meta";
import QuestionDetailContent from "../components/QuestionDetailContent";
import MentorLayout from "@/layouts/mentor-layout";

const QuestionDetailPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Chi tiết câu hỏi - Bit Learning" description="Xem chi tiết thông tin câu hỏi" />
      <MentorLayout>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <QuestionDetailContent />
        </div>
      </MentorLayout>
    </>
  );
};

export default QuestionDetailPage;
