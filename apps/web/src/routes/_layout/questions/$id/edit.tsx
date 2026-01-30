import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import EditQuestionPage from "@/feature/question/pages/EditQuestion";

export const Route = createFileRoute("/_layout/questions/$id/edit")({
  component: () => (
    <ProtectedRoute>
      <EditQuestionPage />
    </ProtectedRoute>
  ),
});
