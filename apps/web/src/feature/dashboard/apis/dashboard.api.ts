import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { endpoints } from "@/shared/constants/endpoints";
import { LoginStreakResponse } from "../types/dashboard.type";

export const dashboardApi = {
  getLoginStreak(): Promise<AxiosResponse<ApiResponse<LoginStreakResponse>>> {
    return api.get(`${endpoints.ACCOUNT}/streak`);
  },
};
