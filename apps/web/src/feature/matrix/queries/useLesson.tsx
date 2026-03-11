import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import { lessonApi } from "../api/lesson.api";

export const lessonKeys = {
  list: (page: number, size: number) => ["lessons", "list", page, size] as const,
};

export const useLessons = (page = 0, size = 10) => {
  return useQuery({
    queryKey: lessonKeys.list(page, size),
    queryFn: async () => {
      const response = await lessonApi.getAll({ page, size });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
