import { queryOptions } from '@tanstack/react-query'
import { AxiosInstance } from 'axios'
import type { ApiResponse } from './matrix.type'
import type { SubjectRequest, SubjectResponse } from './subject.type'

export class SubjectApi {
    constructor(private readonly client: AxiosInstance) {}

    // Get all subjects
    getAllSubjects() {
        return queryOptions({
            queryKey: ['subjects'],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<SubjectResponse[]>>('/api/v1/subjects')
                return response.data.data
            },
        })
    }

    // Get subject by ID
    getSubjectById(id: number) {
        return queryOptions({
            queryKey: ['subject', id],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<SubjectResponse>>(`/api/v1/subjects/${id}`)
                return response.data.data
            },
        })
    }

    // Create subject
    createSubject() {
        return {
            mutationFn: async (data: SubjectRequest) => {
                const response = await this.client.post<ApiResponse<SubjectResponse>>('/api/v1/subjects', data)
                return response.data.data
            },
        }
    }

    // Update subject
    updateSubject() {
        return {
            mutationFn: async ({ id, data }: { id: number; data: SubjectRequest }) => {
                const response = await this.client.put<ApiResponse<SubjectResponse>>(`/api/v1/subjects/${id}`, data)
                return response.data.data
            },
        }
    }

    // Delete subject
    deleteSubject() {
        return {
            mutationFn: async (id: number) => {
                const response = await this.client.delete<ApiResponse<object>>(`/api/v1/subjects/${id}`)
                return response.data.data
            },
        }
    }
}
