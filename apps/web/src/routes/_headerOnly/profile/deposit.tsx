import { DepositHistoryPage } from "@/feature/user/page/DepositHistoryPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/deposit")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: DepositHistoryPage,
});
