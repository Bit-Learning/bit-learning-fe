import QuizSessionPage from "@/feature/quiz/pages/QuizSessionPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/quiz-sessions/$sessionId")({
  component: QuizSessionPage,
});
