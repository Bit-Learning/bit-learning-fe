import { HistoryPage } from "@/feature/user/page/HistoryPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/history")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: HistoryPage,
});
