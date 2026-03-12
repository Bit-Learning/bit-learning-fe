import { GenerateExamPage } from "@/feature/exam/pages/GenerateExam";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/exam/generate")({
  component: GenerateExamPage,
});
