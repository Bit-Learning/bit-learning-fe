import PageMeta from "@/shared/components/seo/page-meta";
import MatrixDetailContent from "../components/MatrixDetailContent";
import MentorLayout from "@/layouts/mentor-layout";

const MatrixDetailPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Chi tiết ma trận - Bit Learning" description="Xem và quản lý chi tiết ma trận đề thi" />
      <MentorLayout>
        <MatrixDetailContent />
      </MentorLayout>
    </>
  );
};

export default MatrixDetailPage;
