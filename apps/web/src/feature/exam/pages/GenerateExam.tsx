import PageMeta from "@/shared/components/seo/page-meta";
import MentorLayout from "@/layouts/mentor-layout";
import GenerateExamFlow from "../component/GenerateExamContent";

export const GenerateExamPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Tạo đề thi từ ma trận - Bit Learning" description="Tự động tạo đề thi từ ma trận đề thi" />
      <MentorLayout>
        <GenerateExamFlow />
      </MentorLayout>
    </>
  );
};
