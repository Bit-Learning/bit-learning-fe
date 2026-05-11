import { PostAppealDetailPage } from "@/features/post-appeals/pages/PostAppealDetailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/post-appeals/$id")({
	component: PostAppealDetailPage,
});
