import MyPostPage from "@/feature/forum/pages/MyPost";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/forum/my")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: MyPostPage,
});
