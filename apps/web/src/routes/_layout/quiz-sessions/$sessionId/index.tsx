import QuizSessionPage from "@/feature/quiz/pages/QuizSessionPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/quiz-sessions/$sessionId/")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: QuizSessionPage,
});
