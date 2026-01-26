import { CartPage } from "@/feature/order/pages/CartPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/cart")({
  component: CartPage,
});
