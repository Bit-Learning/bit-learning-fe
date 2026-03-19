import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { TLessonResponse } from "../types/lesson.type";

export interface LessonParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const lessonApi = {
  getAll(params?: LessonParams): Promise<AxiosResponse<ApiResponse<TLessonResponse[]>>> {
    return api.get("/lessons", { params });
  },

  getLessonsBySubject(
    subjectId: number,
    params?: LessonParams,
  ): Promise<AxiosResponse<ApiResponse<TLessonResponse[]>>> {
    return api.get(`/lessons/subject/${subjectId}`, { params });
  },
  getByChapter(chapterId: number): Promise<AxiosResponse<ApiResponse<TLessonResponse[]>>> {
    return api.get(`/lessons/chapter/${chapterId}`);
  },
};
