import React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import ExamDetailContent from "../components/ExamDetailContent";

const ExamDetailPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Chi tiết đề thi - Bit Learning" description="Xem thông tin chi tiết đề thi và bắt đầu làm bài" />
      <ExamDetailContent />
    </>
  );
};

export default ExamDetailPage;
