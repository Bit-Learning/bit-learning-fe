import AdminStructuresPage from "@/features/mindmaps/pages/AdminStructuresPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/mindmap/structure")({
  component: AdminStructuresPage,
});
