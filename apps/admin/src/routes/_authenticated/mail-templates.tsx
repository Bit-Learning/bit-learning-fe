import { createFileRoute } from "@tanstack/react-router";
import { AdminMailTemplatesPage } from "@/features/mail-templates/pages/AdminMailTemplatesPage";

export const Route = createFileRoute("/_authenticated/mail-templates")({
	component: AdminMailTemplatesPage,
});
