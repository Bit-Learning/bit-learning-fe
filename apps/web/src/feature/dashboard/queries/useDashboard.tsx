import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../apis/dashboard.api";

export const LOGIN_STREAK_KEY = ["login-streak"] as const;

export const useLoginStreak = () =>
	useQuery({
		queryKey: LOGIN_STREAK_KEY,
		queryFn: async () => {
			const res = await dashboardApi.getLoginStreak();
			return res.data.data;
		},
	});
