import { createFileRoute } from "@tanstack/react-router";
import PaymentFailed from "@/feature/payment/pages/PaymentFailed";

export const Route = createFileRoute("/payment-failed")({
  component: PaymentFailed,
});
