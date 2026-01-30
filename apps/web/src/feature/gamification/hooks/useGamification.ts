import { useQuery } from "@tanstack/react-query";
import { GamificationService } from "../api/GamificationService";
import type { GlobalLeaderboardEntry, UserProgress } from "../types";

export const gamificationKeys = {
	all: ["gamification"] as const,
	progress: () => [...gamificationKeys.all, "progress"] as const,
};

export const useUserProgress = () => {
	return useQuery<UserProgress | undefined>({
		queryKey: gamificationKeys.progress(),
		queryFn: async () => {
			const response = await GamificationService.getUserProgress();
			return response.data.data;
		},
	});
};

export const useGlobalLeaderboard = (limit: number) => {
	return useQuery<GlobalLeaderboardEntry[], Error>({
		queryKey: [...gamificationKeys.all, "globalLeaderboard", limit],
		queryFn: async () => {
			const response = await GamificationService.getGlobalLeaderboard(limit);
			return response.data.data ?? [];
		},
		staleTime: 60 * 1000,
	});
};
