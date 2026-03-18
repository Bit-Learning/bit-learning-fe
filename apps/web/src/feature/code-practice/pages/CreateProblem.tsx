import PageMeta from "@/shared/components/seo/page-meta";
import CreateProblemContent from "../components/CreateProblemContent";
import MentorLayout from "@/layouts/mentor-layout";
import { useParams } from "@tanstack/react-router";

export const CreateProblemPage: React.FC = () => {
  const params = useParams({ strict: false });
  const problemId = params.id as string | undefined;
  const isEditMode = !!problemId;

  return (
    <>
      <PageMeta
        title={isEditMode ? "Chỉnh sửa Bài Toán - Mentor" : "Tạo Bài Toán - Mentor"}
        description={isEditMode ? "Chỉnh sửa bài toán lập trình" : "Tạo bài toán lập trình mới"}
      />
      <MentorLayout>
        <CreateProblemContent mode={isEditMode ? "edit" : "create"} problemId={problemId} />
      </MentorLayout>
    </>
  );
};
