import { TopUpPage } from "@/feature/user/page/TopUpPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/profile/top-up")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: TopUpPage,
});
