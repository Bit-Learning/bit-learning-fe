import QuizAttemptPage from "@/feature/quiz/pages/QuizAttemptPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/quiz-attempts/$attemptId")({
  component: QuizAttemptPage,
});
