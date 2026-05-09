import ExamListPage from "@/feature/quiz/pages/ExamListPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/exams/")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: ExamListPage,
});
