import { TransactionHistoryPage } from "@/feature/user/page/TransactionHistoryPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/transaction")({
  component: TransactionHistoryPage,
});
