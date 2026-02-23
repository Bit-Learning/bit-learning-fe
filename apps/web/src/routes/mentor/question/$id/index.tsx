import QuestionDetailPage from "@/feature/question/pages/QuestionDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/$id/")({
  component: QuestionDetailPage,
});
