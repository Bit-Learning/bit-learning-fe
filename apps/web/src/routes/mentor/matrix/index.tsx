import MatrixListPage from "@/feature/matrix/page/MatrixList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/matrix/")({
  component: MatrixListPage,
});
