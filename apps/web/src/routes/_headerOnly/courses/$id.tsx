import { createFileRoute } from "@tanstack/react-router";
import CourseDetailPage from "@/feature/course/page/CourseDetail";

export const Route = createFileRoute("/_headerOnly/courses/$id")({
	component: CourseDetailPage,
});
