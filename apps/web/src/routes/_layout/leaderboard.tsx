import { createFileRoute } from "@tanstack/react-router";
import { GeneralError } from "@/feature/errors/general-error";
import LeaderboardPage from "@/feature/game/pages/LeaderboardPage/Leaderboard";

type LeaderboardSearch = {
	gameType?: "QUIZ" | "MATCHING";
};

export const Route = createFileRoute("/_layout/leaderboard")({
	component: LeaderboardPage,
	errorComponent: () => <GeneralError />,
	validateSearch: (search: Record<string, unknown>): LeaderboardSearch => ({
		gameType:
			search.gameType === "MATCHING" || search.gameType === "QUIZ"
				? search.gameType
				: "QUIZ",
	}),
});
