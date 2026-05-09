import { TransactionHistoryPage } from "@/feature/user/page/TransactionHistoryPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/transaction")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: TransactionHistoryPage,
});
