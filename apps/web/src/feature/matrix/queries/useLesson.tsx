import { useQuery } from "@tanstack/react-query";
import { lessonApi, type LessonParams } from "../api/lesson.api";

export const lessonKeys = {
  all: ["lessons"] as const,
  lists: () => [...lessonKeys.all, "list"] as const,
  list: (params?: LessonParams) => [...lessonKeys.lists(), params] as const,
  bySubject: (subjectId: number, params?: LessonParams) =>
    [...lessonKeys.all, "by-subject", subjectId, params] as const,
};

export const useLessons = (params?: LessonParams) => {
  return useQuery({
    queryKey: lessonKeys.list(params),
    queryFn: async () => {
      const response = await lessonApi.getAll(params);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useLessonsBySubject = (
  subjectId: number | undefined | null,
  params?: LessonParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: lessonKeys.bySubject(subjectId!, params),
    queryFn: async () => {
      const response = await lessonApi.getLessonsBySubject(subjectId!, params);
      return response.data.data;
    },
    enabled: options?.enabled !== false && !!subjectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
