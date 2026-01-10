import SubjectDetailPage from "@/features/curriculum/pages/SubjectDetailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/subject/$id")({
  component: SubjectDetailPage,
});
