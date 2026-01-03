import { createFileRoute } from "@tanstack/react-router";
import NewsPage from "@/feature/post/page/News";

export const Route = createFileRoute("/_layout/news/")({
	component: NewsPage,
});
