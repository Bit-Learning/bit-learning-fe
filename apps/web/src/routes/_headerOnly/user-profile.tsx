import { createFileRoute } from "@tanstack/react-router";
import UserProfilePage from "@/feature/user/page/UserProfilePage";
import { requireAuth } from "@/shared/lib/auth-utils";

export const Route = createFileRoute("/_headerOnly/user-profile")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: UserProfilePage,
	staticData: {
		headerStyle: "transparent",
	},
});
