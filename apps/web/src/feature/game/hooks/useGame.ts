import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GameService } from "../api/GameService";
import type { CheckAnswerRequest, SubmitGameRequest } from "../types";

// Query keys
export const gameKeys = {
	all: ["games"] as const,
	lists: () => [...gameKeys.all, "list"] as const,
	list: (page: number, size: number, type?: string) =>
		[...gameKeys.lists(), { page, size, type }] as const,
	details: () => [...gameKeys.all, "detail"] as const,
	detail: (id: number) => [...gameKeys.details(), id] as const,
	logs: (id: number) => [...gameKeys.all, "logs", id] as const,
	leaderboard: (id: number) => [...gameKeys.all, "leaderboard", id] as const,
};

/**
 * Hook to fetch all games with pagination and optional type filter
 */
export const useGames = (page = 0, size = 10, type?: string) => {
	return useQuery({
		queryKey: gameKeys.list(page, size, type),
		queryFn: async () => {
			const response = await GameService.getAllGames(page, size, type);
			return response.data.data;
		},
	});
};

/**
 * Hook to fetch game detail by ID
 */
export const useGameDetail = (gameId: number) => {
	return useQuery({
		queryKey: gameKeys.detail(gameId),
		queryFn: async () => {
			const response = await GameService.getGameById(gameId);
			return response.data.data;
		},
		enabled: !!gameId,
	});
};

/**
 * Hook to check answer
 */
export const useCheckAnswer = () => {
	return useMutation({
		mutationFn: async ({
			gameId,
			request,
		}: {
			gameId: number;
			request: CheckAnswerRequest;
		}) => {
			const response = await GameService.checkAnswer(gameId, request);
			return response.data.data;
		},
	});
};

/**
 * Hook to submit game result
 */
export const useSubmitGame = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			gameId,
			request,
		}: {
			gameId: number;
			request: SubmitGameRequest;
		}) => {
			const response = await GameService.submitGameResult(gameId, request);
			return response.data.data;
		},
		onSuccess: (_, variables) => {
			// Invalidate game logs and leaderboard
			queryClient.invalidateQueries({
				queryKey: gameKeys.logs(variables.gameId),
			});
			queryClient.invalidateQueries({
				queryKey: gameKeys.leaderboard(variables.gameId),
			});
			queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
		},
	});
};

/**
 * Hook to get user game logs
 */
export const useGameLogs = (gameId: number) => {
	return useQuery({
		queryKey: gameKeys.logs(gameId),
		queryFn: async () => {
			const response = await GameService.getUserGameLogs(gameId);
			return response.data.data;
		},
		enabled: !!gameId,
	});
};

/**
 * Hook to get leaderboard
 */
export const useLeaderboard = (gameId: number, limit = 10) => {
	return useQuery({
		queryKey: gameKeys.leaderboard(gameId),
		queryFn: async () => {
			const response = await GameService.getLeaderboard(gameId, limit);
			return response.data.data;
		},
		enabled: !!gameId,
	});
};
