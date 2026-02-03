import { CheckoutPage } from "@/feature/order/pages/CheckoutPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/checkout/")({
  component: CheckoutPage,
});
