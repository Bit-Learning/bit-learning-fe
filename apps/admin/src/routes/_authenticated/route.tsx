import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { getAccessToken } from "@/lib/cookies";

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
	},
	component: AuthenticatedLayout,
});
