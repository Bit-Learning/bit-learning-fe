import { createFileRoute } from "@tanstack/react-router";
import SyllabusList from "@/feature/syllabus/page/SyllabusList";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";

export const Route = createFileRoute("/_layout/syllabuses/")({
	component: () => (
		<ProtectedRoute>
			<SyllabusList />
		</ProtectedRoute>
	),
});
