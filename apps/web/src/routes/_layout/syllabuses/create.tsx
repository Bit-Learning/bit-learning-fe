import { createFileRoute } from "@tanstack/react-router";
import CreateSyllabus from "@/feature/syllabus/page/CreateSyllabus";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/syllabuses/create")({
	component: () => (
		<ProtectedRoute>
			<CreateSyllabus />
		</ProtectedRoute>
	),
});
