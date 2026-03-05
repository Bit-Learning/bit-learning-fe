import { CreateContestPage } from "@/features/contests/pages/CreateContestPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/contests/create")({
  component: CreateContestPage,
});
