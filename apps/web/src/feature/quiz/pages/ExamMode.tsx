import React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import ExamModeContent from "../components/ExamModeContent";

const ExamModePage: React.FC = () => {
  return (
    <>
      <PageMeta title="Chọn chế độ làm bài - Bit Learning" description="Lựa chọn giữa chế độ thi và luyện tập" />
      <ExamModeContent />
    </>
  );
};

export default ExamModePage;
