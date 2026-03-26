import AdminThemesPage from "@/features/mindmaps/pages/AdminThemesPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/mindmap/themes")({
  component: AdminThemesPage,
});
