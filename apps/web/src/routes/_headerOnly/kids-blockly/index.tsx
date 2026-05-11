import KidsBlocklyPage from "@/feature/kids-blockly/pages/KidsBlocklyPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/kids-blockly/")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: KidsBlocklyPage,
});
