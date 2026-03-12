import { CourseListPage } from "@/features/courses/pages/CourseListPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/courses/")({
  component: CourseListPage,
});
