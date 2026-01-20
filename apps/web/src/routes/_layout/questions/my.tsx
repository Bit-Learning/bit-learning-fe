import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import MyQuestionsPage from "@/feature/question/pages/MyQuestions";

export const Route = createFileRoute("/_layout/questions/my")({
  component: () => (
    <ProtectedRoute>
      <MyQuestionsPage />
    </ProtectedRoute>
  ),
});
