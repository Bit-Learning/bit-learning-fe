import { createFileRoute } from "@tanstack/react-router";
import { SlidevPresentationsPage } from "@/feature/templates/pages/SlidevPresentationsPage";

export const Route = createFileRoute("/_layout/templates/slidev/")({
	component: SlidevPresentationsPage,
});
