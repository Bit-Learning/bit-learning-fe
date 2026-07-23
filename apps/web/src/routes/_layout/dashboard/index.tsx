import StudentDashboard from "@/feature/dashboard/page/StudentDashboard";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/dashboard/")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: StudentDashboard,
});
