import ImportQuestionPage from "@/feature/question/pages/ImportQuestion";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/question/import")({
  component: ImportQuestionPage,
});
