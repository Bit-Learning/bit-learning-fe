import { createFileRoute } from "@tanstack/react-router";
import AllCoursesPage from "@/feature/course/page/ListCourse";

export const Route = createFileRoute("/_layout/courses/")({
  validateSearch: (search: Record<string, unknown>) => ({
    minGrade: search.minGrade ? Number(search.minGrade) : undefined,
    maxGrade: search.maxGrade ? Number(search.maxGrade) : undefined,
  }),
  component: AllCoursesPage,
});
