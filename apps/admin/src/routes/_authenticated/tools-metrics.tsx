import { ToolsMetricsPage } from "@/features/dashboard/pages/ToolsMetricsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/tools-metrics")({
	component: ToolsMetricsPage,
});
