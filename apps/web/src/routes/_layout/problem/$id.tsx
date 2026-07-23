import { ProblemSolvePage } from "@/feature/code-practice/pages/ProblemSolve";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/problem/$id")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: ProblemSolvePage,
});
