import MatchingHistoryPage from "@/feature/game/pages/MatchingHistoryPage/MatchingHistoryPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matching/history")({
	component: MatchingHistoryPage,
});
