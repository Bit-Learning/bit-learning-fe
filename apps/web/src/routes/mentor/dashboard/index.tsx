import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "@/feature/mentor-dashboard/page";

export const Route = createFileRoute("/mentor/dashboard/")({
	component: DashboardPage,
});
