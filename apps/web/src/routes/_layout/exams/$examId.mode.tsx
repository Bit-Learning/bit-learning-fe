import ExamModePage from "@/feature/quiz/pages/ExamMode";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/exams/$examId/mode")({
  component: function ExamModeRoute() {
    const { examId } = Route.useParams();
    const id = Number(examId);

    return <ExamModePage examId={id} />;
  },
});
