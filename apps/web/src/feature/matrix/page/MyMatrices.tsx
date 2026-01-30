import PageMeta from "@/shared/components/seo/page-meta";
import MyMatricesContent from "../components/MyMatricesContent";

const MyMatricesPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Ma trận của tôi - Bit Learning" description="Các ma trận đề thi do bạn tạo" />
      <MyMatricesContent />
    </>
  );
};

export default MyMatricesPage;
