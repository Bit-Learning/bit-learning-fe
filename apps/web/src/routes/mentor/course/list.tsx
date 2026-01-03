import { createFileRoute } from "@tanstack/react-router";
import CoursesListPage from "@/feature/mentor-course/pages/CourseListPage";

export const Route = createFileRoute("/mentor/course/list")({
	component: CoursesListPage,
});
