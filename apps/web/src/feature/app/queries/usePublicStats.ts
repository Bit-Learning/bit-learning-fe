import { useQuery } from "@tanstack/react-query";
import { publicStatsApi } from "../apis/public-stats.api";

export const usePublicStudentCount = () =>
	useQuery({
		queryKey: ["public-stats", "students-count"],
		queryFn: async () => {
			const response = await publicStatsApi.getStudentCount();
			return response.data ?? 0;
		},
		staleTime: 5 * 60 * 1000,
	});

export const usePublicStudentAvatars = (limit = 3) =>
	useQuery({
		queryKey: ["public-stats", "student-avatars", limit],
		queryFn: async () => {
			const response = await publicStatsApi.getStudentAvatars(limit);
			return response.data ?? [];
		},
		staleTime: 5 * 60 * 1000,
	});
