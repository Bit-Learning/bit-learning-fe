import StudentDashboard from "@/feature/dashboard/page/StudentDashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/dashboard/")({
  component: StudentDashboard,
});
