import { StudentProblemListPage } from "@/feature/code-practice/pages/StudentProblemList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/problem/")({
	component: StudentProblemListPage,
});
