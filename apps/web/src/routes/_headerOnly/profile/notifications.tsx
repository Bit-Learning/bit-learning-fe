import { NotificationsPage } from "@/feature/user/page/NotificationsPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/notifications")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: NotificationsPage,
  staticData: {
    headerStyle: "transparent",
  },
});
