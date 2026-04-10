import AdminMindmapPage from "@/features/mindmaps/pages/AdminMindmapPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/mindmap/")({
	component: AdminMindmapPage,
});
