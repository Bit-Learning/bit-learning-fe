import MyAppealPage from "@/feature/forum/pages/MyAppealPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/forum/appeals")({
	component: MyAppealPage,
});
