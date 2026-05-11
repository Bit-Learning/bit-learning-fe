import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";

export interface StudentHeroAvatar {
	id: number;
	firstName?: string;
	lastName?: string;
	avatar?: string;
	role?: string;
}

export const publicStatsApi = {
	getStudentCount: async () => {
		const response = await api.get<ApiResponse<number>>(
			"/users/students/count",
		);
		return response.data;
	},
	getStudentAvatars: async (limit = 3) => {
		const response = await api.get<ApiResponse<StudentHeroAvatar[]>>(
			"/users/students/avatars",
			{
				params: { limit },
			},
		);
		return response.data;
	},
};
