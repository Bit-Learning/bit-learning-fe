import PageMeta from "@/shared/components/seo/page-meta";
import CreateMatrixContent from "../components/CreateMatrixContent";

const CreateMatrixPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Tạo ma trận - Bit Learning" description="Tạo ma trận đề thi mới" />
      <CreateMatrixContent />
    </>
  );
};

export default CreateMatrixPage;
