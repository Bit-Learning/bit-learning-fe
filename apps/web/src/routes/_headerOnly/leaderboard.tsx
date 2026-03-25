import { createFileRoute } from "@tanstack/react-router";
import { GeneralError } from "@/feature/errors/general-error";
import Leaderboard from "@/feature/game/components/Leaderboard";

export const Route = createFileRoute("/_headerOnly/leaderboard")({
	component: Leaderboard,
	errorComponent: () => <GeneralError />,
});
