import { ContestListPage } from "@/feature/contest/pages/ContestList";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/contests/")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: ContestListPage,
});
