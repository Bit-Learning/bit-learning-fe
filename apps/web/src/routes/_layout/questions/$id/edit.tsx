import { createFileRoute } from "@tanstack/react-router";
import EditQuestion from "@/feature/matrix/page/EditQuestion";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/questions/$id/edit")({
	component: () => (
		<ProtectedRoute>
			<EditQuestion />
		</ProtectedRoute>
	),
});
