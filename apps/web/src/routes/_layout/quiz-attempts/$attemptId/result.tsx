import QuizAttemptResultPage from "@/feature/quiz/pages/QuizAttemptResult";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/quiz-attempts/$attemptId/result")({
  component: QuizAttemptResultPage,
});
