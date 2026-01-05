import { createFileRoute } from "@tanstack/react-router";
import TemplatePreviewPage from "@/feature/templates/pages/TemplatePreviewPage";

export const Route = createFileRoute("/_layout/templates/template-preview")({
	component: TemplatePreviewPage,
});
