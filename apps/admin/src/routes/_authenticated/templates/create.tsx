import { TemplateCreatePage } from "@/features/templates/pages/TemplateCreatePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/templates/create")({
  component: TemplateCreatePage,
});
