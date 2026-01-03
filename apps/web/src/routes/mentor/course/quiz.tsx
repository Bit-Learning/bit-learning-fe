import { createFileRoute } from "@tanstack/react-router";
import QuizPage from "@/feature/mentor-course/pages/QuizPage";

export const Route = createFileRoute("/mentor/course/quiz")({
	component: QuizPage,
});
