import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/dashboard/pages/AdminDashboard";
import { ManagerDashboard } from "@/features/dashboard/pages/ManagerDashboard";
import { useAdminProfile } from "@/features/auth/queries/useAuth";

function DashboardRouter() {
  const { data: userProfile } = useAdminProfile();

  if (userProfile?.role === "MANAGER") {
    return <ManagerDashboard />;
  }

  return <Dashboard />;
}

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardRouter,
});
