import { createFileRoute } from "@tanstack/react-router";
import GenerateExamFromQuestions from "@/feature/matrix/page/GenerateExamFromQuestions";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/exams/generate")({
	component: () => (
		<ProtectedRoute>
			<GenerateExamFromQuestions />
		</ProtectedRoute>
	),
});
