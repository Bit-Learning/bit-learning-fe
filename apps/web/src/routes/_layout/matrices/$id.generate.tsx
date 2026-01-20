import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { GenerateExamPage } from "@/feature/exam/pages/GenerateExam";

export const Route = createFileRoute("/_layout/matrices/$id/generate")({
  component: () => (
    <ProtectedRoute>
      <GenerateExamPage />
    </ProtectedRoute>
  ),
});
