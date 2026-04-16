import { createFileRoute } from "@tanstack/react-router";
import { GeneralError } from "@/feature/errors/general-error";
import LeaderboardPage from "@/feature/game/pages/LeaderboardPage/Leaderboard";

export const Route = createFileRoute("/_layout/leaderboard")({
	component: LeaderboardPage,
	errorComponent: () => <GeneralError />,
});
