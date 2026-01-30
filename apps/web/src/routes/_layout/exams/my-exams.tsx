import { createFileRoute } from "@tanstack/react-router";
import { MyExamsPage } from "@/feature/exam/pages/MyExam";

export const Route = createFileRoute("/_layout/exams/my-exams")({
  component: MyExamsPage,
});
