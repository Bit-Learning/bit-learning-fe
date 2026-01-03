import { createFileRoute } from "@tanstack/react-router";
import LectureDetailPage from "@/feature/lecture/page/LectureDetail";

export const Route = createFileRoute("/_layout/lectures/$id")({
	component: LectureDetailPage,
});
