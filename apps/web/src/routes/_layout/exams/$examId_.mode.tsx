import ExamModePage from "@/feature/quiz/pages/ExamMode";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/exams/$examId_/mode")({
  component: ExamModePage,
});
