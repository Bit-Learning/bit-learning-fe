import { MyContestPage } from "@/feature/contest/pages/MyContest";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/contests/my")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: MyContestPage,
});
