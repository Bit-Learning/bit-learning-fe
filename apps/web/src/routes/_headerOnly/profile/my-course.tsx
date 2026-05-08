import { MyCoursePage } from "@/feature/user/page/MyCoursePage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/my-course")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: MyCoursePage,
});
