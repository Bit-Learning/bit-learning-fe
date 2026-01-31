import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { CourseDetail, CoursePreview, SectionDetail } from "../types/course.type";

export const courseApi = {
  getAllCourses(page: number = 0, size: number = 10): Promise<AxiosResponse<ApiResponse<CoursePreview[]>>> {
    return api.get("/courses", {
      params: { page, size },
    });
  },

  getCourseById(id: number): Promise<AxiosResponse<ApiResponse<CourseDetail>>> {
    return api.get(`/courses/${id}`);
  },

  getSectionsByCourseId(courseId: number): Promise<AxiosResponse<ApiResponse<SectionDetail[]>>> {
    return api.get("/sections", {
      params: { courseId },
    });
  },

  validateCourse(id: number, isAccepted: boolean): Promise<AxiosResponse<ApiResponse<void>>> {
    return api.post(`/courses/validate/${id}`, null, {
      params: { isAccepted },
    });
  },
};
