import { createFileRoute } from "@tanstack/react-router";
import CoursesByGradePage from "@/feature/course/page/CourseByGrade";

export const Route = createFileRoute("/_layout/courses/grade/$grade")({
	component: CoursesByGradePage,
});
