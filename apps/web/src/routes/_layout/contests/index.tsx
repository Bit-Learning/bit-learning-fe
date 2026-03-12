import { ContestListPage } from "@/feature/contest/pages/ContestList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/contests/")({
  component: ContestListPage,
});
