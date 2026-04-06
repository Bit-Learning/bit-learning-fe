import { createFileRoute } from "@tanstack/react-router";
import AllCoursesPage from "@/feature/course/page/ListCourse";

export const Route = createFileRoute("/_layout/courses/")({
	component: AllCoursesPage,
});
