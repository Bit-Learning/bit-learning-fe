import MatchingGameHomePage from "@/feature/game/pages/MatchingGameHomePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matching/")({
	component: () => <MatchingGameHomePage />,
});
