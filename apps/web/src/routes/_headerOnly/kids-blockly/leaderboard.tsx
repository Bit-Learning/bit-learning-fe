import KidsBlocklyLeaderboard from "@/feature/kids-blockly/pages/KidsBlocklyLeaderboard";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/kids-blockly/leaderboard")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: KidsBlocklyLeaderboard,
});
