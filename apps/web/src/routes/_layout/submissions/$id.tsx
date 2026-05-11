import SubmissionResultContent from "@/feature/code-practice/components/SubmissionResultContent";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/submissions/$id")({
  component: SubmissionResultContent,
});
