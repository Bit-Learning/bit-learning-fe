import { ExamDetailPage } from "@/feature/exam/pages/ExamDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/exam/$id")({
  component: ExamDetailPage,
});
