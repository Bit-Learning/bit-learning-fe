import { PaymentResultPage } from "@/feature/order/pages/PaymentResult";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/payment-result")({
  component: PaymentResultPage,
});
