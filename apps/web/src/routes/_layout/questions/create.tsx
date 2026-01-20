import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import CreateQuestionPage from "@/feature/question/pages/CreateQuestion";

export const Route = createFileRoute("/_layout/questions/create")({
  component: () => (
    <ProtectedRoute>
      <CreateQuestionPage />
    </ProtectedRoute>
  ),
});
