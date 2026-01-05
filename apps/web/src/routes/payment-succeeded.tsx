import { createFileRoute } from "@tanstack/react-router";
import PaymentSucceeded from "@/feature/payment/page/PaymentSucceeded";

export const Route = createFileRoute("/payment-succeeded")({
	component: PaymentSucceeded,
});
