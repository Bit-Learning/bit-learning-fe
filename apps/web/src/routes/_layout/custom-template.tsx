import { createFileRoute } from "@tanstack/react-router";
import CreateTemplatePage from "@/feature/templates/pages/CreateTemplatePage";

export const Route = createFileRoute("/_layout/custom-template")({
	component: CreateTemplatePage,
});
