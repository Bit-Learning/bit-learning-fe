import PostFormPage from "@/feature/forum/pages/PostForm";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/forum/create")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: PostFormPage,
});
