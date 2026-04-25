import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthenticatedLayout } from "@/layout/authenticated-layout";
import { getAccessToken } from "@/shared/lib/cookies";
// import { useAuthStore } from "@/shared/stores/auth-store";

// const ALLOWED_ROLES = ["ADMIN", "MANAGER"];

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ location }) => {
		const accessToken = getAccessToken();

		if (!accessToken) {
			throw redirect({
				to: "/sign-in",
				search: {
					redirect: location.href,
				},
			});
		}

		// const { user } = useAuthStore.getState().auth;

		// if (
		// 	!user ||
		// 	!user.role ||
		// 	!user.role.some((r) => ALLOWED_ROLES.includes(r))
		// ) {
		// 	throw redirect({
		// 		to: "/sign-in",
		// 	});
		// }
	},
	component: AuthenticatedLayout,
});
