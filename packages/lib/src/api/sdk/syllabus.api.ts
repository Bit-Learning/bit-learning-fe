import { queryOptions } from '@tanstack/react-query'
import { AxiosInstance } from 'axios'
import type {
    ApiResponse,
    PageSyllabusResponse,
    Pageable,
    SyllabusDetailRequest,
    SyllabusDetailResponse,
    SyllabusRequest,
    SyllabusResponse,
    SyllabusVersionRequest,
    SyllabusVersionResponse,
} from './syllabus.type'

export class SyllabusApi {
    constructor(private readonly client: AxiosInstance) {}

    // Get all syllabuses with pagination
    getAllSyllabuses(params?: { subjectId?: number; pageable?: Pageable }) {
        return queryOptions({
            queryKey: ['syllabuses', params],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<PageSyllabusResponse>>('/api/v1/syllabuses', {
                    params,
                })
                return response.data.data
            },
        })
    }

    // Get syllabus by ID
    getSyllabusById(id: number) {
        return queryOptions({
            queryKey: ['syllabus', id],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<SyllabusResponse>>(`/api/v1/syllabuses/${id}`)
                return response.data.data
            },
        })
    }

    // Get my syllabuses (requires X-User-Id header)
    getMySyllabuses(userId: number, pageable?: Pageable) {
        return queryOptions({
            queryKey: ['syllabuses', 'my', userId, pageable],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<PageSyllabusResponse>>(
                    '/api/v1/syllabuses/my-syllabuses',
                    {
                        headers: { 'X-User-Id': userId },
                        params: pageable,
                    },
                )
                return response.data.data
            },
        })
    }

    // Create syllabus
    createSyllabus() {
        return {
            mutationFn: async (data: SyllabusRequest) => {
                const response = await this.client.post<ApiResponse<SyllabusResponse>>('/api/v1/syllabuses', data)
                return response.data.data
            },
        }
    }

    // Update syllabus
    updateSyllabus() {
        return {
            mutationFn: async ({ id, data }: { id: number; data: SyllabusRequest }) => {
                const response = await this.client.put<ApiResponse<SyllabusResponse>>(`/api/v1/syllabuses/${id}`, data)
                return response.data.data
            },
        }
    }

    // Delete syllabus
    deleteSyllabus() {
        return {
            mutationFn: async (id: number) => {
                const response = await this.client.delete<ApiResponse<object>>(`/api/v1/syllabuses/${id}`)
                return response.data.data
            },
        }
    }

    // Set active status
    setActiveStatus() {
        return {
            mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
                const response = await this.client.patch<ApiResponse<SyllabusResponse>>(
                    `/api/v1/syllabuses/${id}/status`,
                    null,
                    { params: { isActive } },
                )
                return response.data.data
            },
        }
    }

    // Syllabus Version operations
    getAllVersionsBySyllabus(syllabusId: number) {
        return queryOptions({
            queryKey: ['syllabus-versions', syllabusId],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<SyllabusVersionResponse[]>>(
                    '/api/v1/syllabus-versions',
                    { params: { syllabusId } },
                )
                return response.data.data
            },
        })
    }

    getLatestVersion(syllabusId: number) {
        return queryOptions({
            queryKey: ['syllabus-version', 'latest', syllabusId],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<SyllabusVersionResponse>>(
                    '/api/v1/syllabus-versions/latest',
                    { params: { syllabusId } },
                )
                return response.data.data
            },
        })
    }

    getVersionById(versionId: number) {
        return queryOptions({
            queryKey: ['syllabus-version', versionId],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<SyllabusVersionResponse>>(
                    `/api/v1/syllabus-versions/${versionId}`,
                )
                return response.data.data
            },
        })
    }

    createVersion() {
        return {
            mutationFn: async (data: SyllabusVersionRequest) => {
                const response = await this.client.post<ApiResponse<SyllabusVersionResponse>>(
                    '/api/v1/syllabus-versions',
                    data,
                )
                return response.data.data
            },
        }
    }

    deleteVersion() {
        return {
            mutationFn: async (versionId: number) => {
                const response = await this.client.delete<ApiResponse<object>>(`/api/v1/syllabus-versions/${versionId}`)
                return response.data.data
            },
        }
    }

    // Syllabus Detail operations
    getDetailsByVersion(versionId: number) {
        return queryOptions({
            queryKey: ['syllabus-details', versionId],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<SyllabusDetailResponse[]>>(
                    '/api/v1/syllabus-details',
                    {
                        params: { versionId },
                    },
                )
                return response.data.data
            },
        })
    }

    updateSyllabusDetail() {
        return {
            mutationFn: async ({ id, data }: { id: number; data: SyllabusDetailRequest }) => {
                const response = await this.client.put<ApiResponse<SyllabusDetailResponse>>(
                    `/api/v1/syllabus-details/${id}`,
                    data,
                )
                return response.data.data
            },
        }
    }

    deleteSyllabusDetail() {
        return {
            mutationFn: async (id: number) => {
                const response = await this.client.delete<ApiResponse<object>>(`/api/v1/syllabus-details/${id}`)
                return response.data.data
            },
        }
    }
}
