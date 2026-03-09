import { TemplateListPage } from "@/features/templates/pages/TemplateListPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/templates/")({
  component: TemplateListPage,
});
