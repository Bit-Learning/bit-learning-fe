import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { learningApi } from "../api/learning.api";
import type { SyncProgressRequest } from "../types/learning.type";

const LEARNING_KEYS = {
	all: ["learning"] as const,
	progress: (lectureId: number) =>
		[...LEARNING_KEYS.all, "progress", lectureId] as const,
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
