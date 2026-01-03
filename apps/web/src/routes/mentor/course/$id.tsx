import { createFileRoute } from "@tanstack/react-router";
import CourseDetailPage from "@/feature/mentor-course/pages/CourseDetailPage";

export const Route = createFileRoute("/mentor/course/$id")({
	component: CourseDetailPage,
});
