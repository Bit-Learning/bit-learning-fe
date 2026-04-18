import { useQuery } from "@tanstack/react-query";
import { adminGamesApi } from "../api/admin-games.api";

export const ADMIN_GAME_ANALYTICS_KEYS = {
	all: ["admin-games", "analytics"] as const,
	dashboard: (days: number) =>
		["admin-games", "analytics", "dashboard", days] as const,
	detail: (id: number, days: number) =>
		["admin-games", "analytics", "detail", id, days] as const,
};

export const useAdminGameAnalyticsDashboard = (days = 30) => {
	return useQuery({
		queryKey: ADMIN_GAME_ANALYTICS_KEYS.dashboard(days),
		queryFn: async () => {
			const response = await adminGamesApi.getAnalytics(days);
			return response.data.data;
		},
	});
};

export const useAdminGameDetailAnalytics = (id?: number, days = 30) => {
	return useQuery({
		queryKey: ADMIN_GAME_ANALYTICS_KEYS.detail(id ?? 0, days),
		queryFn: async () => {
			if (!id) {
				throw new Error("Game id is required");
			}
			const response = await adminGamesApi.getGameAnalytics(id, days);
			return response.data.data;
		},
		enabled: Boolean(id),
	});
};
