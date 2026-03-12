import React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import QuizAttemptResultContent from "../components/AttemptResultContent";

const QuizAttemptResultPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Kết quả bài thi - Bit Learning" description="Xem chi tiết kết quả và phân tích bài thi" />
      <QuizAttemptResultContent />
    </>
  );
};

export default QuizAttemptResultPage;
