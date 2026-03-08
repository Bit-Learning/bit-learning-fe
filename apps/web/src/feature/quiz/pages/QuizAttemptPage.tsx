import React from "react";
import { useParams } from "@tanstack/react-router";
import PageMeta from "@/shared/components/seo/page-meta";
import QuizAttemptContent from "../components/QuizAttemptContent";

const QuizAttemptPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Làm bài thi - Bit Learning" description="Làm bài thi trắc nghiệm có thời gian" />
      <QuizAttemptContent />
    </>
  );
};

export default QuizAttemptPage;
