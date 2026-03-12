import ContestDetailPage from "@/features/contests/pages/ContestDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/contests/$id")({
  component: ContestDetailPage,
});
