import AdminExamApprovalPage from "@/features/exams/pages/AdminExamApprovalPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/exams/")({
	component: AdminExamApprovalPage,
});
