import PageMeta from "@/shared/components/seo/page-meta";
import ExamDetailContent from "../component/ExamDetailContent";

export const ExamDetailPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Chi tiết đề thi - Bit Learning" description="Xem chi tiết thông tin đề thi" />
      <ExamDetailContent />
    </>
  );
};
