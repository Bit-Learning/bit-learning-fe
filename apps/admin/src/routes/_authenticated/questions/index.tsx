import { QuestionApprovalList } from "@/features/questions/pages/QuestionApprovalList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/questions/")({
  component: QuestionApprovalList,
});
