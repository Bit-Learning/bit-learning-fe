import { MentorProblemListPage } from "@/feature/code-practice/pages/MentorProblemList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/problem/")({
  component: MentorProblemListPage,
});
