import { ContestLayout } from "@/feature/contest/layouts/ContestLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contests/$id/")({
  component: ContestLayout,
});
