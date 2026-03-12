import PageMeta from "@/shared/components/seo/page-meta";
import MyExamsContent from "../component/MyExamContent";
import MentorLayout from "@/layouts/mentor-layout";

export const MyExamsPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Đề thi của tôi - Bit Learning" description="Quản lý các đề thi bạn đã tạo" />
      <MentorLayout>
        <MyExamsContent />
      </MentorLayout>
    </>
  );
};
