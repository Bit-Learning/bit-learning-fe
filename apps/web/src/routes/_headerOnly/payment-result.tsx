import { PaymentResultPage } from "@/feature/order/pages/PaymentResult";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/payment-result")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: PaymentResultPage,
});
