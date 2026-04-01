import { DepositHistoryPage } from "@/feature/user/page/DepositHistoryPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/deposit")({
  component: DepositHistoryPage,
});
