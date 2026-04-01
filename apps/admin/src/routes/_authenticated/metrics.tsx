import { Dashboard } from "@/features/dashboard/pages/SystemMetricsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/metrics")({
	component: Dashboard,
});
