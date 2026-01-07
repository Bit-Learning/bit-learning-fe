import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { learningApi } from "../api/learning.api";
import type { SyncProgressRequest } from "../types/learning.type";

export const LEARNING_KEYS = {
  all: ["learning"] as const,
  progress: (lectureId: number) => [...LEARNING_KEYS.all, "progress", lectureId] as const,
  isCompleted: (lectureId: number) => [...LEARNING_KEYS.all, "isCompleted", lectureId] as const,
};

export const useLectureProgress = (lectureId: number) => {
  return useQuery({
    queryKey: LEARNING_KEYS.progress(lectureId),
    queryFn: async () => {
      const response = await learningApi.getLectureProgress(lectureId);
      return response.data.data ?? 0;
    },
    enabled: !!lectureId,
    staleTime: 0,
  });
};
export const useIsLectureCompleted = (lectureId: number) => {
  return useQuery({
    queryKey: LEARNING_KEYS.isCompleted(lectureId),
    queryFn: async () => {
      const response = await learningApi.isLectureCompleted(lectureId);
      return response.data.data ?? false;
    },
    enabled: !!lectureId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMultipleLecturesCompleted = (lectureIds: number[]) => {
  const results = useQueries({
    queries: lectureIds.map((id) => ({
      queryKey: LEARNING_KEYS.isCompleted(id),
      queryFn: async () => {
        const response = await learningApi.isLectureCompleted(id);
        return { id, isCompleted: response.data.data ?? false };
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    })),
  });

  const completedIds = results.filter((r) => r.data?.isCompleted).map((r) => r.data!.id);

  const isLoading = results.some((r) => r.isLoading);

  return { completedIds, isLoading };
};
export const useSyncProgress = () => {
  return useMutation({
    mutationFn: (data: SyncProgressRequest) => learningApi.syncProgress(data),
  });
};

export const useMarkAsCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lectureId: number) => learningApi.markAsCompleted(lectureId),
    onSuccess: (_, lectureId) => {
      queryClient.invalidateQueries({
        queryKey: LEARNING_KEYS.progress(lectureId),
      });
      queryClient.invalidateQueries({ queryKey: LEARNING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
};
