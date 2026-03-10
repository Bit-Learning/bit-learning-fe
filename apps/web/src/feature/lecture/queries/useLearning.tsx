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
    select: (data) => (typeof data === "object" && data !== null ? (data as any).isCompleted : data) as boolean,
  });
};

export const useMultipleLecturesCompleted = (lectureIds: number[]) => {
  const results = useQueries({
    queries: lectureIds.map((id) => ({
      queryKey: LEARNING_KEYS.isCompleted(id),
      queryFn: async () => {
        const response = await learningApi.isLectureCompleted(id);
        return response.data.data ?? false;
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    })),
  });

  const completedIds = results
    .map((r, idx) => {
      const data = r.data as any;
      const isCompleted = typeof data === "object" && data !== null ? data.isCompleted : data;
      return isCompleted ? lectureIds[idx] : null;
    })
    .filter((id): id is number => id !== null);

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
      queryClient.setQueryData(LEARNING_KEYS.isCompleted(lectureId), true);
      queryClient.invalidateQueries({ queryKey: LEARNING_KEYS.progress(lectureId) });
    },
  });
};
