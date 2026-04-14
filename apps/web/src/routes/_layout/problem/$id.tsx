import { ProblemSolvePage } from "@/feature/code-practice/pages/ProblemSolve";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/problem/$id")({
	component: ProblemSolvePage,
});
