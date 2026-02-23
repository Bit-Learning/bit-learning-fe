import QuestionListPage from "@/feature/question/pages/QuestionList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/")({
  component: QuestionListPage,
});
