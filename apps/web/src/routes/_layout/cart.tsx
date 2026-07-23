import { CartPage } from "@/feature/order/pages/CartPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/cart")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: CartPage,
});
