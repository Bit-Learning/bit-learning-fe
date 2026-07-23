import TagManagementPage from "@/features/tags/pages/TagManagementPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/tags/")({
	component: TagManagementPage,
});
