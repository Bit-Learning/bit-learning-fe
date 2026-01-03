import { createFileRoute } from "@tanstack/react-router";
import EditSyllabus from "@/feature/syllabus/page/EditSyllabus";

export const Route = createFileRoute("/_layout/syllabuses/$id/edit")({
	component: EditSyllabus,
});
