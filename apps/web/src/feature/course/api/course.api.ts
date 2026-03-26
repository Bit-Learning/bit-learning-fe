import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { endpoints } from "@/shared/constants/endpoints";
import type { CourseDetail, CoursePreview, MyCourse, VerifyCertificateResponse } from "../types/course.type";

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
  getMyCourses(page: number = 0, size: number = 10): Promise<AxiosResponse<ApiResponse<MyCourse[]>>> {
    return api.get("/courses/my-courses", {
      params: { page, size },
    });
  },

  getCertificate(courseId: number): Promise<AxiosResponse<Blob>> {
    return api.get(`${endpoints.COURSES}/${courseId}/certificate`, {
      responseType: "blob",
    });
  },

  downloadCertificate(courseId: number): void {
    const url = `${endpoints.COURSES}/${courseId}/certificate/download`;
    const a = document.createElement("a");
    a.href = api.defaults.baseURL + url;
    a.download = "certificate.png";
    a.click();
  },

  verifyCertificate(file: File): Promise<AxiosResponse<ApiResponse<VerifyCertificateResponse>>> {
    const formData = new FormData();
    formData.append("certificate", file);
    return api.post(`${endpoints.COURSES}/certificate/verify`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
