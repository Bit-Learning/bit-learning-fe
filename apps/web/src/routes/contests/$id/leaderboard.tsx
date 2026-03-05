import ContestLeaderboardPage from "@/feature/contest/pages/ContestLeaderboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contests/$id/leaderboard")({
  component: ContestLeaderboardPage,
});
