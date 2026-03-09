import { TemplateDetailPage } from "@/features/templates/pages/TemplateDetailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/templates/$id")({
  component: TemplateDetailPage,
});
