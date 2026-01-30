import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	HostGameService,
	type CreateSessionRequest,
} from "../api/HostGameService";

export const hostGameKeys = {
	all: ["hostGame"] as const,
	session: (pin: string | undefined) =>
		[...hostGameKeys.all, "session", pin] as const,
	leaderboard: (pin: string | undefined) =>
		[...hostGameKeys.all, "leaderboard", pin] as const,
};

export const useCreateSession = () => {
	return useMutation({
		mutationFn: async (payload: CreateSessionRequest) => {
			const response = await HostGameService.createSession(payload);
			return response.data.data;
		},
	});
};

export const useHostLeaderboard = (pinCode?: string) => {
	return useQuery({
		queryKey: hostGameKeys.leaderboard(pinCode),
		queryFn: async () => {
			if (!pinCode) return undefined;
			const response = await HostGameService.getLeaderboard(pinCode);
			return response.data.data;
		},
		enabled: !!pinCode,
		refetchInterval: 5000,
	});
};

export const useStartSession = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (pinCode: string) => {
			const response = await HostGameService.startSession(pinCode);
			return response.data.data;
		},
		onSuccess: (_, pinCode) => {
			queryClient.invalidateQueries({
				queryKey: hostGameKeys.leaderboard(pinCode),
			});
		},
	});
};

export const useEndSession = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (pinCode: string) => {
			const response = await HostGameService.endSession(pinCode);
			return response.data.data;
		},
		onSuccess: (_, pinCode) => {
			queryClient.invalidateQueries({
				queryKey: hostGameKeys.leaderboard(pinCode),
			});
		},
	});
};
