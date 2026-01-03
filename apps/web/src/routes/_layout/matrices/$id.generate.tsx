import { createFileRoute } from "@tanstack/react-router";
import GenerateExam from "@/feature/matrix/page/GenerateExam";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/matrices/$id/generate")({
	component: () => (
		<ProtectedRoute>
			<GenerateExam />
		</ProtectedRoute>
	),
});
