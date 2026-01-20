import PageMeta from "@/shared/components/seo/page-meta";
import MatrixDetailContent from "../components/MatrixDetailContent";

const MatrixDetailPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Chi tiết ma trận - Bit Learning" description="Xem và quản lý chi tiết ma trận đề thi" />
      <MatrixDetailContent />
    </>
  );
};

export default MatrixDetailPage;
