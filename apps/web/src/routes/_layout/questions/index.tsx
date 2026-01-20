import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import QuestionListPage from "@/feature/question/pages/QuestionList";

export const Route = createFileRoute("/_layout/questions/")({
  component: () => (
    <ProtectedRoute>
      <QuestionListPage />
    </ProtectedRoute>
  ),
});
