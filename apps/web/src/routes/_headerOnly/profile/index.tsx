import { UserProfilePage } from "@/feature/user/page/UserProfilePage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: UserProfilePage,
  staticData: {
    headerStyle: "transparent",
  },
});
