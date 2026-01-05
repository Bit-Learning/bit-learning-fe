import { createFileRoute } from "@tanstack/react-router";
import CreateMatrix from "@/feature/matrix/page/CreateMatrix";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/matrices/$id/edit")({
	component: () => (
		<ProtectedRoute>
			<CreateMatrix />
		</ProtectedRoute>
	),
});
