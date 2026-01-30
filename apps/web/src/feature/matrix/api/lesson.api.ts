import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { TLessonResponse } from "../types/lesson.type";

export const lessonApi = {
  getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<AxiosResponse<ApiResponse<TLessonResponse[]>>> {
    return api.get("/lessons", { params });
  },
};
