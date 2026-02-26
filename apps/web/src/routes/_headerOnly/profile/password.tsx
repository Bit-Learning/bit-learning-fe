import { PasswordPage } from "@/feature/user/page/PasswordPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/password")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: PasswordPage,
});
