import { createFileRoute } from "@tanstack/react-router";
import GameWPMTestingPage from "@/feature/game/page/GameWPMTestingPage";

export const Route = createFileRoute("/test-wpm")({
	component: RouteComponent,
});

function RouteComponent() {
	return <GameWPMTestingPage />;
}
