import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { TChapterResponse } from "../types/chapter.type";

export const chapterApi = {
  getById(id: number): Promise<AxiosResponse<ApiResponse<TChapterResponse>>> {
    return api.get(`/chapters/${id}`);
  },

  getBySubject(subjectId: number): Promise<AxiosResponse<ApiResponse<TChapterResponse[]>>> {
    return api.get(`/chapters/subject/${subjectId}`);
  },

  getAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<AxiosResponse<ApiResponse<TChapterResponse[]>>> {
    return api.get("/chapters", { params });
  },
};
