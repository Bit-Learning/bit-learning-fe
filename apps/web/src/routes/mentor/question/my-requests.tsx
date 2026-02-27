import MyQuestionsApprovalPage from "@/feature/question/pages/MyQuestionApproval";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/my-requests")({
  component: MyQuestionsApprovalPage,
});
