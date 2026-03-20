import { TopUpPage } from "@/feature/user/page/TopUpPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/top-up")({
  component: TopUpPage,
});
