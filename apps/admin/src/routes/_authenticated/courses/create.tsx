import { CreateCoursePage } from "@/features/courses/pages/CreateCoursePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/courses/create")({
	component: CreateCoursePage,
});
