import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/dashboard/pages/AdminDashboard";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});
