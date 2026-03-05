import ContestQAPage from "@/feature/contest/pages/ContestQAPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contests/$id/qa")({
  component: ContestQAPage,
});
