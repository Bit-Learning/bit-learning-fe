import MyQuestionsPage from "@/feature/question/pages/MyQuestions";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/my")({
  component: MyQuestionsPage,
});
