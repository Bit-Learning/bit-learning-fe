import ContestProblemsPage from "@/feature/contest/pages/ContestProblems";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contests/$id/problems/$problemId")({
  component: ContestProblemsPage,
});
