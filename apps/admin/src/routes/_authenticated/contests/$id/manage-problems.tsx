import AddContestProblems from "@/features/contests/pages/AddContestProblems";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/contests/$id/manage-problems")({
  component: AddContestProblems,
});
