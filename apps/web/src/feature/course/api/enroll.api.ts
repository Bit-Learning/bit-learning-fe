import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";

export const enrollApi = {
	enrollCourse(courseId: number): Promise<AxiosResponse<ApiResponse<void>>> {
		return api.post(`/enrollments/enroll/${courseId}`);
	},

	checkCourseAccess(
		courseId: number,
	): Promise<AxiosResponse<ApiResponse<boolean>>> {
		return api.get(`/enrollments/courses/${courseId}/access`);
	},

	getCourseProgress(
		courseId: number,
	): Promise<AxiosResponse<ApiResponse<number>>> {
		return api.get(`enrollments/courses/${courseId}/progress`);
	},
};
