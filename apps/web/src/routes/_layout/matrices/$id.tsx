import MatrixDetailPage from "@/feature/matrix/page/MatrixDetailPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/matrices/$id")({
  component: MatrixDetailPage,
});
