import { StudentProblemListPage } from "@/feature/code-practice/pages/StudentProblemList";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_layout/problem/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 0,
    };
  },
  component: StudentProblemListPage,
});
