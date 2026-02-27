import PageMeta from "@/shared/components/seo/page-meta";
import MentorLayout from "@/layouts/mentor-layout";
import QuestionApprovalTableView from "../components/QuestionApprovalView";

const MyQuestionsApprovalPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Yêu cầu phê duyệt câu hỏi - Bit Learning"
        description="Quản lý danh sách yêu cầu duyệt câu hỏi"
      />
      <MentorLayout>
        <div>
          <QuestionApprovalTableView />
        </div>
      </MentorLayout>
    </>
  );
};

export default MyQuestionsApprovalPage;
