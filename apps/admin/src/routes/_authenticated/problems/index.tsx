import AdminProblemApprovalPage from "@/features/problems/pages/AdminProblemApprovalPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/problems/")({
  component: AdminProblemApprovalPage,
});
