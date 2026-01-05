import { createFileRoute } from "@tanstack/react-router";
import MatrixList from "@/feature/matrix/page/MatrixList";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/matrices/")({
	component: () => (
		<ProtectedRoute>
			<MatrixList />
		</ProtectedRoute>
	),
});
