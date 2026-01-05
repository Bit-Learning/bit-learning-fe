import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { SyncProgressRequest } from "../types/learning.type";

export const learningApi = {
	syncProgress: (data: SyncProgressRequest) => {
		return api.post<ApiResponse<void>>("/learning/progress/sync", data);
	},

	markAsCompleted: (lectureId: number) => {
		return api.post<ApiResponse<void>>(
			`/learning/progress/lectures/${lectureId}/complete`,
		);
	},

	getLectureProgress: (lectureId: number) => {
		return api.get<ApiResponse<number>>(
			`/learning/progress/lectures/${lectureId}`,
		);
	},
};
