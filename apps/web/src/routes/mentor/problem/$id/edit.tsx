import { CreateProblemPage } from "@/feature/code-practice/pages/CreateProblem";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/problem/$id/edit")({
  component: CreateProblemPage,
});
