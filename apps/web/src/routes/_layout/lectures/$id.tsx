import { createFileRoute } from "@tanstack/react-router";
import LectureDetailPage from "@/feature/lecture/page/LectureDetail";
import { requireAuth } from "@/shared/lib/auth-utils";

export const Route = createFileRoute("/_layout/lectures/$id")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: LectureDetailPage,
});
