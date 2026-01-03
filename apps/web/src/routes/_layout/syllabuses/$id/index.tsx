import { createFileRoute } from "@tanstack/react-router";
import SyllabusDetail from "@/feature/syllabus/page/SyllabusDetail";

export const Route = createFileRoute("/_layout/syllabuses/$id/")({
	component: SyllabusDetail,
});
