import CurriculumListPage from "@/features/curriculum/pages/CurriculumListPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/curriculum/")({
  component: CurriculumListPage,
});
