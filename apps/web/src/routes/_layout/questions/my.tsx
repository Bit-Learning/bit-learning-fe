import { createFileRoute } from "@tanstack/react-router";
import MyQuestions from "@/feature/matrix/page/MyQuestions";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/questions/my")({
	component: () => (
		<ProtectedRoute>
			<MyQuestions />
		</ProtectedRoute>
	),
});
