import MyMatricesPage from "@/feature/matrix/page/MyMatrices";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/matrix/my")({
  component: MyMatricesPage,
});
