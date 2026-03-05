import ContestListPage from "@/features/contests/pages/ContestList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/contests/")({
  component: ContestListPage,
});
