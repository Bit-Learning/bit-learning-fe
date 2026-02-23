import CreateMatrixPage from "@/feature/matrix/page/CreateMatrix";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/matrix/create")({
  component: CreateMatrixPage,
});
