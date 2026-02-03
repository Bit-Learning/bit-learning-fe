import { CourseDetailPage } from "@/features/courses/pages/CourseDetailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/courses/$id")({
  component: CourseDetailPage,
});
