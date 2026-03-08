import ExamDetailPage from "@/feature/quiz/pages/ExamDetailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/exams/$examId")({
  component: ExamDetailPage,
});
