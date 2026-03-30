import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { SyncProgressRequest, UserLearningStatistics } from "../types/learning.type";
import { AxiosResponse } from "axios";

export const learningApi = {
  syncProgress: (data: SyncProgressRequest) => {
    return api.post<AxiosResponse<ApiResponse<void>>>("/learning/progress/sync", data);
  },

  markAsCompleted: (lectureId: number) => {
    return api.post<AxiosResponse<ApiResponse<void>>>(`/learning/progress/lectures/${lectureId}/complete`);
  },

  getLectureProgress: (lectureId: number) => {
    return api.get<AxiosResponse<ApiResponse<number>>>(`/learning/progress/lectures/${lectureId}`);
  },
  isLectureCompleted: (lectureId: number) => {
    return api.get<AxiosResponse<ApiResponse<boolean>>>(`/learning/progress/lectures/${lectureId}/is-completed`);
  },

  getMyStatistics: () => {
    return api.get<ApiResponse<UserLearningStatistics>>("/enrollments/my-statistics");
  },
};
