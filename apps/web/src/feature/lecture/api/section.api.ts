import api from '@/shared/api/api'
import { ApiResponse } from '@/shared/api/api.type'
import { endpoints } from '@/shared/constants/endpoints'
import { AxiosResponse } from 'axios'
import { SectionDetail } from '../types/section.type'

export const sectionApi = {
    getAllSectionsByCourseId(courseId: number): Promise<AxiosResponse<ApiResponse<SectionDetail[]>>> {
        return api.get(`${endpoints.SECTIONS}`, {
            params: { courseId },
        })
    },
}
