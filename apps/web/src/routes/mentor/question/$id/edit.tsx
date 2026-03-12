import EditQuestionPage from "@/feature/question/pages/EditQuestion";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/$id/edit")({
  component: EditQuestionPage,
});
