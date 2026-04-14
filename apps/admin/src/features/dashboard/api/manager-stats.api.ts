import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { ManagerStatsDto } from "../types/manager-stats.type";
import { AxiosResponse } from "axios";

export const managerStatsApi = {
  getManagerStats(): Promise<AxiosResponse<ApiResponse<ManagerStatsDto>>> {
    return api.get("/statistics/manager");
  },
};
