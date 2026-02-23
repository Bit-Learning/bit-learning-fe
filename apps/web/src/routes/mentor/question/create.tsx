import CreateQuestionPage from "@/feature/question/pages/CreateQuestion";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/create")({
  component: CreateQuestionPage,
});
