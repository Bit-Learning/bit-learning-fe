import { createFileRoute } from "@tanstack/react-router";
import QuestionDetail from "@/feature/matrix/page/QuestionDetail";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/questions/$id/")({
	component: () => (
		<ProtectedRoute>
			<QuestionDetail />
		</ProtectedRoute>
	),
});
