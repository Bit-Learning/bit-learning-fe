import { MentorProblemDetailPage } from "@/feature/code-practice/pages/MentorProblemDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/problem/$id")({
  component: MentorProblemDetailPage,
});
