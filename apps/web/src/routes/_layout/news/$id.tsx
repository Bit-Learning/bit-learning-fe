import { createFileRoute } from "@tanstack/react-router";
import NewsDetailPage from "@/feature/post/page/NewsDetail";

export const Route = createFileRoute("/_layout/news/$id")({
	component: NewsDetailPage,
});
