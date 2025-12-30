import api from '@/shared/api/api'
import { ApiResponse } from '@/shared/api/api.type'
import { endpoints } from '@/shared/constants/endpoints'
import { AxiosResponse } from 'axios'

export const enrollApi = {
    enrollCourse(courseId: number): Promise<AxiosResponse<ApiResponse<void>>> {
        return api.post(`/enroll/${courseId}`)
    },

    checkCourseAccess(courseId: number): Promise<AxiosResponse<ApiResponse<boolean>>> {
        return api.get(`${endpoints.COURSES}/${courseId}/access`)
    },

    getCourseProgress(courseId: number): Promise<AxiosResponse<ApiResponse<number>>> {
        return api.get(`${endpoints.COURSES}/${courseId}/progress`)
    },
}
