import ContestSubmissionsPage from "@/feature/contest/pages/ContestSubmissions";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contests/$id/submissions")({
  component: ContestSubmissionsPage,
});
