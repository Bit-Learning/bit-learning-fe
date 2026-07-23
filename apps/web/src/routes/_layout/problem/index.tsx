import { StudentProblemListPage } from "@/feature/code-practice/pages/StudentProblemList";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/problem/")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: StudentProblemListPage,
});
