import React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import ExamListContent from "../components/ExamListContent";

const ExamListPage: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Danh sách đề thi - Bit Learning"
        description="Khám phá và làm bài thi trắc nghiệm online cho học sinh THPT"
      />
      <ExamListContent />
    </>
  );
};

export default ExamListPage;
