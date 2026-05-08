import QuizAttemptPage from "@/feature/quiz/pages/QuizAttemptPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/quiz-attempts/$attemptId/")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: QuizAttemptPage,
});
