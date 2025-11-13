import { queryOptions } from '@tanstack/react-query'
import { AxiosInstance } from 'axios'
import type {
    ExamGenerateFromQuestionsRequest,
    ExamGenerateFromUserQuestionsRequest,
    ExamGenerateRequest,
    ExamResponse,
    PageExamBriefResponse,
} from './exam.type'
import type { ApiResponse, Pageable } from './matrix.type'

export class ExamApi {
    constructor(private readonly client: AxiosInstance) {}

    // Get all exams with pagination
    getAllExams(params?: { matrixId?: number; pageable: Pageable }) {
        return queryOptions({
            queryKey: ['exams', params],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<PageExamBriefResponse>>('/api/v1/exams', { params })
                return response.data.data
            },
        })
    }

    // Get user's exams with pagination
    getMyExams(userId: number, params?: { page?: number; size?: number; search?: string }) {
        return queryOptions({
            queryKey: ['my-exams', userId, params],
            queryFn: async () => {
                // Build clean params object, exclude empty search
                const cleanParams: any = {
                    page: params?.page ?? 0,
                    size: params?.size ?? 10,
                }

                // Only add search if it's not empty
                if (params?.search && params.search.trim()) {
                    cleanParams.search = params.search
                }

                const response = await this.client.get<ApiResponse<PageExamBriefResponse>>('/api/v1/exams/my-exams', {
                    params: cleanParams,
                    headers: {
                        'X-User-Id': userId.toString(),
                    },
                })
                return response.data.data
            },
        })
    }

    // Get exam by ID
    getExamById(id: number) {
        return queryOptions({
            queryKey: ['exam', id],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<ExamResponse>>(`/api/v1/exams/${id}`)
                return response.data.data
            },
        })
    }

    // Generate exam from matrix
    generateExam() {
        return {
            mutationFn: async (data: ExamGenerateRequest) => {
                const response = await this.client.post<ApiResponse<ExamResponse>>('/api/v1/exams/generate', data)
                return response.data.data
            },
        }
    }

    // Generate exam from user questions
    generateExamFromUserQuestions() {
        return {
            mutationFn: async (data: ExamGenerateFromUserQuestionsRequest) => {
                const response = await this.client.post<ApiResponse<ExamResponse>>(
                    '/api/v1/exams/generate-from-user-questions',
                    data,
                )
                return response.data.data
            },
        }
    }

    // Generate exam from specific questions
    generateExamFromQuestions() {
        return {
            mutationFn: async (data: ExamGenerateFromQuestionsRequest) => {
                const response = await this.client.post<ApiResponse<ExamResponse>>(
                    '/api/v1/exams/generate-from-questions',
                    data,
                )
                return response.data.data
            },
        }
    }

    // Delete exam
    deleteExam() {
        return {
            mutationFn: async (id: number) => {
                const response = await this.client.delete<ApiResponse<object>>(`/api/v1/exams/${id}`)
                return response.data.data
            },
        }
    }

    // Publish exam
    publishExam() {
        return {
            mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
                const response = await this.client.patch<ApiResponse<ExamResponse>>(
                    `/api/v1/exams/${id}/publish`,
                    null,
                    { params: { isPublished } },
                )
                return response.data.data
            },
        }
    }

    // Download exam
    downloadExam(id: number, format: 'pdf' | 'docx') {
        return queryOptions({
            queryKey: ['exam', 'download', id, format],
            queryFn: async () => {
                const response = await this.client.get(`/api/v1/exams/${id}/download`, {
                    params: { format },
                    responseType: 'blob',
                })
                return response.data
            },
        })
    }
}
