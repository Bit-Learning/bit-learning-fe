import { CheckoutPage } from "@/feature/order/pages/CheckoutPage";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/checkout/")({
  beforeLoad: async ({ location }) => {
    requireAuth(location);
  },
  component: CheckoutPage,
});
