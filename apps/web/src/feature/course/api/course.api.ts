import api from '@/shared/api/api'
import { ApiResponse } from '@/shared/api/api.type'
import { endpoints } from '@/shared/constants/endpoints'
import { AxiosResponse } from 'axios'
import { CourseDetail, CoursePreview, PageResponse } from '../types/course.type'

export const courseApi = {
    getCoursesByGrade(
        grade: number,
        page: number = 0,
        size: number = 10,
    ): Promise<AxiosResponse<ApiResponse<PageResponse<CoursePreview>>>> {
        return api.get(`${endpoints.COURSES}/grade/${grade}`, {
            params: { page, size },
        })
    },

    getCourseById(id: number): Promise<AxiosResponse<ApiResponse<CourseDetail>>> {
        return api.get(`${endpoints.COURSES}/${id}`)
    },
}
