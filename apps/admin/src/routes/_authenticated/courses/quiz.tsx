import { QuizFormPage } from "@/features/courses/pages/QuizFormPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/courses/quiz")({
  component: QuizFormPage,
});
