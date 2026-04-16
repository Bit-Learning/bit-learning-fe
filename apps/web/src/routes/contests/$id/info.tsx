import ContestInfoPage from "@/feature/contest/pages/ContestInfoPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contests/$id/info")({
  component: ContestInfoPage,
});
