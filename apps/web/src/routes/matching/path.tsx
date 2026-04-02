import PathPage from "@/feature/game/pages/MatchingGamePath";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matching/path")({
	component: PathPage,
});
