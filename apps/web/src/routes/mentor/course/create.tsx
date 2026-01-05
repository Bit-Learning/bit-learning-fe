import { createFileRoute } from "@tanstack/react-router";
import CreateCoursePage from "@/feature/mentor-course/pages/CreateCoursePage";

export const Route = createFileRoute("/mentor/course/create")({
	component: CreateCoursePage,
});
