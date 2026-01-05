import { createFileRoute } from "@tanstack/react-router";
import MyExams from "@/feature/matrix/page/MyExams";

export const Route = createFileRoute("/_layout/exams/my-exams")({
	component: MyExams,
});
