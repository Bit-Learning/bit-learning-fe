import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import type { TCurriculumResponse } from "../types/curriculum.type";

export const curriculumApi = {
  getAllList(): Promise<AxiosResponse<ApiResponse<TCurriculumResponse[]>>> {
    return api.get("/curriculums/all");
  },
  getById(id: number): Promise<AxiosResponse<ApiResponse<TCurriculumResponse>>> {
    return api.get(`/curriculums/${id}`);
  },
};
