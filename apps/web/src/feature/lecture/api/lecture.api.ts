import api from '@/shared/api/api'
import { ApiResponse } from '@/shared/api/api.type'
import { endpoints } from '@/shared/constants/endpoints'
import { AxiosResponse } from 'axios'
import { LectureQuizDetail } from '../types/lecture.type'

export const lectureApi = {
    getVideoM3u8Url(id: number): string {
        return `${api.defaults.baseURL}lectures/lecture-videos/${id}/m3u8`
    },

    getVideoSegmentUrl(id: number, segment: string): string {
        return `${api.defaults.baseURL}lectures/lecture-videos/${id}/${segment}`
    },
    fetchVideoM3u8(id: number): Promise<AxiosResponse<string>> {
        return api.get(`${endpoints.LECTURE_VIDEO}/${id}/m3u8`, {
            responseType: 'text',
            headers: {
                Accept: 'application/vnd.apple.mpegurl',
            },
        })
    },

    fetchVideoSegment(id: number, segment: string): Promise<AxiosResponse<Blob>> {
        return api.get(`${endpoints.LECTURE_VIDEO}/${id}/${segment}`, {
            responseType: 'blob',
            headers: {
                Accept: 'video/MP2T',
            },
        })
    },
    getLectureQuizById(id: number): Promise<AxiosResponse<ApiResponse<LectureQuizDetail>>> {
        return api.get(`${endpoints.LECTURE_QUIZ}/${id}`)
    },
}
