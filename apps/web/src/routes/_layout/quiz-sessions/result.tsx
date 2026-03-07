import QuizSessionResultPage from "@/feature/quiz/pages/QuizSessionResult";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/quiz-sessions/result")({
  component: QuizSessionResultPage,
});
