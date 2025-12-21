import api from '@/shared/api/api'
import { ApiResponse } from '@/shared/api/api.type'
import { endpoints } from '@/shared/constants/endpoints'
import { AxiosResponse } from 'axios'
import { CreateCourseRequest, UpdateCourseRequest } from '../types/mcourse.type'

export const mcourseApi = {
    createCourse(data: CreateCourseRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return api.post(endpoints.COURSES, data)
    },

    updateCourse(id: number, data: UpdateCourseRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return api.patch(`${endpoints.COURSES}/${id}`, data)
    },

    deleteCourse(id: number): Promise<AxiosResponse<ApiResponse<void>>> {
        return api.delete(`${endpoints.COURSES}/${id}/force`)
    },

    hideOrShowCourse(id: number, isHidden: boolean): Promise<AxiosResponse<ApiResponse<void>>> {
        return api.delete(`${endpoints.COURSES}/${id}`, {
            params: { isHidden },
        })
    },

    updateCourseThumbnail(id: number, thumbnail: File): Promise<AxiosResponse<ApiResponse<void>>> {
        const formData = new FormData()
        formData.append('thumbnail', thumbnail)

        return api.patch(`${endpoints.COURSES}/${id}/thumbnail`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },
}
