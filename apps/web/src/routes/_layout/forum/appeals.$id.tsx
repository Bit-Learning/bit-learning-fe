import MyAppealDetailPage from "@/feature/forum/pages/MyAppealDetailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/forum/appeals/$id")({
	component: MyAppealDetailPage,
});
