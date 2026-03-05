import { MyContestPage } from "@/feature/contest/pages/MyContest";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/contests/my")({
  component: MyContestPage,
});
