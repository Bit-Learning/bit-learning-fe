import PageMeta from "@/shared/components/seo/page-meta";
import MatrixListContent from "../components/MatrixListContent";
import MentorLayout from "@/layouts/mentor-layout";

const MatrixListPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Ma trận đề thi - Bit Learning" description="Quản lý ma trận và tạo đề thi tự động" />
      <MentorLayout>
        <MatrixListContent />
      </MentorLayout>
    </>
  );
};

export default MatrixListPage;
