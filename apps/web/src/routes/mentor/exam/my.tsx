import { MyExamsPage } from "@/feature/exam/pages/MyExam";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/exam/my")({
  component: MyExamsPage,
});
