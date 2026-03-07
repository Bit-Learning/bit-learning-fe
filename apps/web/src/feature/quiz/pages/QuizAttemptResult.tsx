import React from "react";
import { useParams } from "@tanstack/react-router";
import PageMeta from "@/shared/components/seo/page-meta";
import AttemptResultContent from "../components/AttemptResultContent";

const QuizAttemptResultPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Kết quả bài thi - Bit Learning" description="Xem chi tiết kết quả và phân tích bài thi" />
      <AttemptResultContent />
    </>
  );
};

export default QuizAttemptResultPage;
