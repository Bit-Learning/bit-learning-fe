import { GenerateExamPage } from "@/feature/exam/pages/GenerateExam";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/matrix/$id/generate")({
  validateSearch: (search) => ({
    versionId: Number(search.versionId),
  }),
  component: GenerateExamPage,
});
