import { createFileRoute } from "@tanstack/react-router";
import MySyllabuses from "@/feature/syllabus/page/MySyllabuses";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/syllabuses/my")({
	component: () => (
		<ProtectedRoute>
			<MySyllabuses />
		</ProtectedRoute>
	),
});
