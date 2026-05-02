import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { endpoints } from "@/shared/constants/endpoints";
import type {
  CourseDetail,
  CoursePreview,
  MyCourse,
  SearchCourseRequest,
  VerifyCertificateResponse,
} from "../types/course.type";

export const courseApi = {
  getCoursesByGrade(grade: number, page = 0, size = 100): Promise<AxiosResponse<ApiResponse<CoursePreview[]>>> {
    return api.get(`${endpoints.COURSES}/grade/${grade}`, { params: { page, size } });
  },

  getCourseById(id: number): Promise<AxiosResponse<ApiResponse<CourseDetail>>> {
    return api.get(`${endpoints.COURSES}/${id}`);
  },

  getMyCourses(page = 0, size = 10): Promise<AxiosResponse<ApiResponse<MyCourse[]>>> {
    return api.get(`${endpoints.COURSES}/my-courses`, { params: { page, size } });
  },

  searchCourses(
    request: SearchCourseRequest,
    page = 0,
    size = 100,
  ): Promise<AxiosResponse<ApiResponse<CoursePreview[]>>> {
    return api.post(`${endpoints.COURSES}/search`, request, { params: { page, size } });
  },

  getCertificate(courseId: number): Promise<AxiosResponse<Blob>> {
    return api.get(`${endpoints.COURSES}/${courseId}/certificate`, { responseType: "blob" });
  },

  downloadCertificate(courseId: number): Promise<AxiosResponse<Blob>> {
    return api.get(`${endpoints.COURSES}/${courseId}/certificate/download`, { responseType: "blob" });
  },

  verifyCertificate(file: File): Promise<AxiosResponse<ApiResponse<VerifyCertificateResponse>>> {
    const formData = new FormData();
    formData.append("certificate", file);
    return api.post(`${endpoints.COURSES}/certificate/verify`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getAllCategories(): Promise<AxiosResponse<ApiResponse<string[]>>> {
    return api.get(`${endpoints.COURSES}/categories`);
  },
};
