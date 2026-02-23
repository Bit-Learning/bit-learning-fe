import PageMeta from "@/shared/components/seo/page-meta";
import CreateMatrixContent from "../components/CreateMatrixContent";
import MentorLayout from "@/layouts/mentor-layout";

const CreateMatrixPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Tạo ma trận - Bit Learning" description="Tạo ma trận đề thi mới" />
      <MentorLayout>
        <CreateMatrixContent />
      </MentorLayout>
    </>
  );
};

export default CreateMatrixPage;
