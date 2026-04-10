import PostDetailPage from "@/feature/forum/pages/PostDetailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/forum/post/$id")({
	component: PostDetailPage,
});
