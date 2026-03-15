import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { endpoints } from "@/shared/constants/endpoints";
import type { CourseDetail, CoursePreview } from "../types/course.type";

export const courseApi = {
  getCoursesByGrade(grade: number, page = 0, size = 10): Promise<AxiosResponse<ApiResponse<CoursePreview>>> {
    return api.get(`${endpoints.COURSES}/grade/${grade}`, {
      params: { page, size },
    });
  },

  getCourseById(id: number): Promise<AxiosResponse<ApiResponse<CourseDetail>>> {
    return api.get(`${endpoints.COURSES}/${id}`);
  },
  getAllCourses(page: number = 0, size: number = 10): Promise<AxiosResponse<ApiResponse<CoursePreview[]>>> {
    return api.get("/courses", {
      params: { page, size },
    });
  },
};
