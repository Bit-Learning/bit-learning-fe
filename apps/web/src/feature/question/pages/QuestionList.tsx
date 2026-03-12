import PageMeta from "@/shared/components/seo/page-meta";
import QuestionListContent from "../components/QuestionListContent";
import MentorLayout from "@/layouts/mentor-layout";

const QuestionListPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Danh sách câu hỏi - Bit Learning" description="Quản lý danh sách câu hỏi" />
      <MentorLayout>
        <div>
          <QuestionListContent />
        </div>
      </MentorLayout>
    </>
  );
};

export default QuestionListPage;
