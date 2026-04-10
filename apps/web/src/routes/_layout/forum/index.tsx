import ForumPage from "@/feature/forum/pages/ForumPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/forum/")({
	component: ForumPage,
});
