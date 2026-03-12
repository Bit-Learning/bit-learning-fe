import { useQuery } from "@tanstack/react-query";
import { ProblemFilters } from "../types/problem.type";
import { Language } from "../types/contest.type";
import { problemApi } from "../apis/problem.api";

export const problemKeys = {
  all: ["problems"] as const,
  lists: () => [...problemKeys.all, "list"] as const,
  list: (filters?: ProblemFilters) => [...problemKeys.lists(), filters] as const,
  details: () => [...problemKeys.all, "detail"] as const,
  detail: (id: string, language?: Language) => [...problemKeys.details(), id, language] as const,
};

export const useProblems = (filters?: ProblemFilters) => {
  return useQuery({
    queryKey: problemKeys.list(filters),
    queryFn: async () => {
      const response = await problemApi.getProblems(filters);
      return response.data;
    },
  });
};

export const useProblemDetail = (problemId: string, language?: Language, _p0?: { enabled: boolean }) => {
  return useQuery({
    queryKey: problemKeys.detail(problemId, language),
    queryFn: async () => {
      const response = await problemApi.getProblemDetail(problemId, language);
      return response.data.data;
    },
    enabled: !!problemId,
  });
};
