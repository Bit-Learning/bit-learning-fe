import PageMeta from "@/shared/components/seo/page-meta";
import MatrixListContent from "../components/MatrixListContent";

const MatrixListPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Ma trận đề thi - Bit Learning" description="Quản lý ma trận và tạo đề thi tự động" />
      <MatrixListContent />
    </>
  );
};

export default MatrixListPage;
