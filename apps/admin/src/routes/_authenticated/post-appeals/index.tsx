import { PostAppealListPage } from "@/features/post-appeals/pages/PostAppealListPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/post-appeals/")({
	component: PostAppealListPage,
});
