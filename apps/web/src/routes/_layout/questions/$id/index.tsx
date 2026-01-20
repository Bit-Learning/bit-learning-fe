import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import QuestionDetailPage from "@/feature/question/pages/QuestionDetail";

export const Route = createFileRoute("/_layout/questions/$id/")({
  component: () => (
    <ProtectedRoute>
      <QuestionDetailPage />
    </ProtectedRoute>
  ),
});
