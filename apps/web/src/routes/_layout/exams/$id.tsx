import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { ExamDetailPage } from "@/feature/exam/pages/ExamDetail";

export const Route = createFileRoute("/_layout/exams/$id")({
  component: () => (
    <ProtectedRoute>
      <ExamDetailPage />
    </ProtectedRoute>
  ),
});
