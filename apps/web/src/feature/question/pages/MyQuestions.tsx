import PageMeta from "@/shared/components/seo/page-meta";
import MyQuestionsContent from "../components/MyQuestionContent";
import MentorLayout from "@/layouts/mentor-layout";
import { MentorHeader } from "@/shared/components/mentor/mentor-header";

const MyQuestionsPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Danh sách câu hỏi của tôi - Bit Learning" description="Quản lý danh sách câu hỏi của tôi" />
      <MentorLayout>
        <div>
          <MentorHeader />
          <MyQuestionsContent />
        </div>
      </MentorLayout>
    </>
  );
};

export default MyQuestionsPage;
