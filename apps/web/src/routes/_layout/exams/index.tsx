import ExamListPage from "@/feature/quiz/pages/ExamListPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/exams/")({
  component: ExamListPage,
});
