import { LoadingPage } from "@/feature/game/pages/MatchingLoading/MatchingLoading";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matching/loading")({
	component: LoadingPage,
});
