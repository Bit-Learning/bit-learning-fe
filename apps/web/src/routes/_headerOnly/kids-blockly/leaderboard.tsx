import KidsBlocklyLeaderboard from "@/feature/kids-blockly/pages/KidsBlocklyLeaderboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/kids-blockly/leaderboard")({
  component: KidsBlocklyLeaderboard,
});
