import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { AxiosResponse } from "axios";
import type { MentorDashboardStatsResponse } from "../types/mentor.type";

export const mentorStatsApi = {
  getMentorStats(): Promise<AxiosResponse<ApiResponse<MentorDashboardStatsResponse>>> {
    return api.get("/statistics/mentor");
  },
};
