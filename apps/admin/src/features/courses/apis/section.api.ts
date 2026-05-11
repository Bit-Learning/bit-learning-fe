import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { CreateSectionRequest, SectionDetail, UpdateSectionRequest } from "../types/section.type";

export const msectionApi = {
  getAllSectionsByCourseId(courseId: number): Promise<AxiosResponse<ApiResponse<SectionDetail[]>>> {
    return api.get(`sections`, {
      params: { courseId },
    });
  },
  createSection(data: CreateSectionRequest): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.post("sections", data);
  },

  updateSection(id: number, data: UpdateSectionRequest): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.patch(`sections/${id}`, data);
  },

  deleteSection(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`sections/${id}/force`);
  },

  hideOrShowSection(id: number, isHidden: boolean): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.delete(`sections/${id}`, {
      params: { isHidden },
    });
  },
};
