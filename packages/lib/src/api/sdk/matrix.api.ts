import { queryOptions } from '@tanstack/react-query'
import { AxiosInstance } from 'axios'
import type {
    ApiResponse,
    MatrixDetailRequest,
    MatrixDetailResponse,
    MatrixRequest,
    MatrixResponse,
    MatrixVersionRequest,
    MatrixVersionResponse,
    PageMatrixResponse,
    Pageable,
} from './matrix.type'

export class MatrixApi {
    constructor(private readonly client: AxiosInstance) {}

    // Get all matrices with pagination
    getAllMatrices(params?: { subjectId?: number; pageable: Pageable }) {
        return queryOptions({
            queryKey: ['matrices', params],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<PageMatrixResponse>>('/api/v1/matrices', { params })
                return response.data.data
            },
        })
    }

    // Get matrix by ID
    getMatrixById(id: number) {
        return queryOptions({
            queryKey: ['matrix', id],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<MatrixResponse>>(`/api/v1/matrices/${id}`)
                return response.data.data
            },
        })
    }

    // Get my matrices (requires X-User-Id header)
    getMyMatrices(userId: number, pageable: Pageable) {
        return queryOptions({
            queryKey: ['matrices', 'my', userId, pageable],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<PageMatrixResponse>>(
                    '/api/v1/matrices/my-matrices',
                    {
                        headers: { 'X-User-Id': userId },
                        params: pageable,
                    },
                )
                return response.data.data
            },
        })
    }

    // Create matrix
    createMatrix() {
        return {
            mutationFn: async (data: MatrixRequest) => {
                const response = await this.client.post<ApiResponse<MatrixResponse>>('/api/v1/matrices', data)
                return response.data.data
            },
        }
    }

    // Update matrix
    updateMatrix() {
        return {
            mutationFn: async ({ id, data }: { id: number; data: MatrixRequest }) => {
                const response = await this.client.put<ApiResponse<MatrixResponse>>(`/api/v1/matrices/${id}`, data)
                return response.data.data
            },
        }
    }

    // Delete matrix
    deleteMatrix() {
        return {
            mutationFn: async (id: number) => {
                const response = await this.client.delete<ApiResponse<object>>(`/api/v1/matrices/${id}`)
                return response.data.data
            },
        }
    }

    // Set active status
    setActiveStatus() {
        return {
            mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
                const response = await this.client.patch<ApiResponse<MatrixResponse>>(
                    `/api/v1/matrices/${id}/status`,
                    null,
                    { params: { isActive } },
                )
                return response.data.data
            },
        }
    }

    // Matrix Version operations
    getAllVersionsByMatrix(matrixId: number) {
        return queryOptions({
            queryKey: ['matrix-versions', matrixId],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<MatrixVersionResponse[]>>(
                    '/api/v1/matrix-versions',
                    { params: { matrixId } },
                )
                return response.data.data
            },
        })
    }

    getLatestVersion(matrixId: number) {
        return queryOptions({
            queryKey: ['matrix-version', 'latest', matrixId],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<MatrixVersionResponse>>(
                    '/api/v1/matrix-versions/latest',
                    { params: { matrixId } },
                )
                return response.data.data
            },
        })
    }

    getVersionById(versionId: number) {
        return queryOptions({
            queryKey: ['matrix-version', versionId],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<MatrixVersionResponse>>(
                    `/api/v1/matrix-versions/${versionId}`,
                )
                return response.data.data
            },
        })
    }

    createVersion() {
        return {
            mutationFn: async (data: MatrixVersionRequest) => {
                const response = await this.client.post<ApiResponse<MatrixVersionResponse>>(
                    '/api/v1/matrix-versions',
                    data,
                )
                return response.data.data
            },
        }
    }

    deleteVersion() {
        return {
            mutationFn: async (versionId: number) => {
                const response = await this.client.delete<ApiResponse<object>>(`/api/v1/matrix-versions/${versionId}`)
                return response.data.data
            },
        }
    }

    // Matrix Detail operations
    getDetailsByVersion(versionId: number) {
        return queryOptions({
            queryKey: ['matrix-details', versionId],
            queryFn: async () => {
                const response = await this.client.get<ApiResponse<MatrixDetailResponse[]>>('/api/v1/matrix-details', {
                    params: { versionId },
                })
                return response.data.data
            },
        })
    }

    updateMatrixDetail() {
        return {
            mutationFn: async ({ id, data }: { id: number; data: MatrixDetailRequest }) => {
                const response = await this.client.put<ApiResponse<MatrixDetailResponse>>(
                    `/api/v1/matrix-details/${id}`,
                    data,
                )
                return response.data.data
            },
        }
    }

    deleteMatrixDetail() {
        return {
            mutationFn: async (id: number) => {
                const response = await this.client.delete<ApiResponse<object>>(`/api/v1/matrix-details/${id}`)
                return response.data.data
            },
        }
    }
}
