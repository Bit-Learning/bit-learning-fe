import ExamDetailPage from "@/feature/quiz/pages/ExamDetailPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/exams/$examId")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: ExamDetailPage,
});
