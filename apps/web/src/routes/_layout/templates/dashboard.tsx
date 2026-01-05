import { createFileRoute } from "@tanstack/react-router";
import TemplateDashboardPage from "@/feature/templates/pages/TemplateDashboardPage";

export const Route = createFileRoute("/_layout/templates/dashboard")({
	component: TemplateDashboardPage,
});
