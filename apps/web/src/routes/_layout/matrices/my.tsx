import { createFileRoute } from "@tanstack/react-router";
import MyMatrices from "@/feature/matrix/page/MyMatrices";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/matrices/my")({
	component: () => (
		<ProtectedRoute>
			<MyMatrices />
		</ProtectedRoute>
	),
});
