import ContestLeaderboardPage from "@/feature/contest/pages/ContestLeaderboard";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contests/$id/leaderboard")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: ContestLeaderboardPage,
});
