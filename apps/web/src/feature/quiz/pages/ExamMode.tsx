import React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import ExamModeContent from "../components/ExamModeContent";

interface ExamModePageProps {
  examId: string | number;
}

const ExamModePage: React.FC<ExamModePageProps> = ({ examId }) => {
  return (
    <>
      <PageMeta title="Chọn chế độ làm bài - Bit Learning" description="Lựa chọn giữa chế độ thi và luyện tập" />
      <ExamModeContent examId={examId} />
    </>
  );
};

export default ExamModePage;
