import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { GenerateExamFromQuestionsPage } from "@/feature/exam/pages/GenerateExamFromQuestions";

export const Route = createFileRoute("/_layout/questions/generate-from-questions")({
  component: () => (
    <ProtectedRoute>
      <GenerateExamFromQuestionsPage />
    </ProtectedRoute>
  ),
});
