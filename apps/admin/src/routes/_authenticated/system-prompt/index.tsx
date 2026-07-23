import { SystemPromptsPage } from "@/features/system-prompt/pages/SystemPromptsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/system-prompt/")({
	component: SystemPromptsPage,
});
