import { GenerateExamFromQuestionsPage } from "@/feature/exam/pages/GenerateExamFromQuestions";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/generate-from-questions")({
  component: GenerateExamFromQuestionsPage,
});
