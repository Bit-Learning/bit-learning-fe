import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import ImportQuestionPage from "@/feature/question/pages/ImportQuestion";

export const Route = createFileRoute("/_layout/matrices/import")({
  component: () => (
    <ProtectedRoute>
      <ImportQuestionPage />
    </ProtectedRoute>
  ),
});
