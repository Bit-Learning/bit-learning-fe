import api from '@/shared/api/api'
import { endpoints } from '@/shared/constants/endpoints'
import { AxiosResponse } from 'axios'
import type {
    ApiResponse,
    BatchQuestionRequest,
    BatchQuestionResponse,
    ConvertToPlaceholdersResponse,
    ExtractPlaceholdersResponse,
    JsonSlideResponse,
    MindmapRequest,
    MindmapResponse,
    QuestionRequest,
    QuestionResponse,
    SlideGenerationResponse,
    SlideHistoryPageResponse,
    SlideRequest,
    TemplateResponse,
    ValidateTemplateResponse,
} from '../type'

export const SlideService = {
    getAllTemplates: (): Promise<AxiosResponse<ApiResponse<TemplateResponse[]>>> => {
        return api.get(`${endpoints.SLIDE}/templates/all`)
    },

    getTemplateById: (id: number): Promise<AxiosResponse<ApiResponse<TemplateResponse>>> => {
        return api.get(`${endpoints.SLIDE}/templates/${id}`)
    },

    uploadFile: (file: File): Promise<AxiosResponse<ApiResponse<string>>> => {
        const formData = new FormData()
        formData.append('file', file)

        return api.post(`${endpoints.SLIDE}/templates/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    downloadTemplate: (url: string, filename: string): Promise<AxiosResponse<Blob>> => {
        return api.get(`${endpoints.SLIDE}/templates/download`, {
            params: { url, filename },
            responseType: 'blob',
        })
    },

    validateTemplate: (
        template: File,
        requiredPlaceholders?: string[],
    ): Promise<AxiosResponse<ApiResponse<ValidateTemplateResponse>>> => {
        const formData = new FormData()
        formData.append('template', template)

        return api.post(`${endpoints.SLIDE}/validate-template`, formData, {
            params: requiredPlaceholders ? { requiredPlaceholders } : {},
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    extractPlaceholders: (template: File): Promise<AxiosResponse<ApiResponse<ExtractPlaceholdersResponse>>> => {
        const formData = new FormData()
        formData.append('template', template)

        return api.post(`${endpoints.SLIDE}/extract-placeholders`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
    generatePPTX: (
        templateId: number,
        request: SlideRequest,
    ): Promise<AxiosResponse<ApiResponse<SlideGenerationResponse>>> => {
        const formData = new FormData()
        formData.append('request', JSON.stringify(request))

        return api.post(`${endpoints.SLIDE}/generate`, formData, {
            params: { templateId },
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    generateJSON: (request: SlideRequest): Promise<AxiosResponse<ApiResponse<JsonSlideResponse>>> => {
        return api.post(`${endpoints.SLIDE}/generate/json`, request)
    },

    generateCustomPPTX: (template: File, placeholders: Record<string, string>): Promise<AxiosResponse<Blob>> => {
        const formData = new FormData()
        formData.append('template', template)
        formData.append('placeholders', JSON.stringify(placeholders))

        return api.post(`${endpoints.SLIDE}/generate-custom`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob',
        })
    },

    convertToPlaceholders: (
        jsonResponse: JsonSlideResponse,
    ): Promise<AxiosResponse<ApiResponse<ConvertToPlaceholdersResponse>>> => {
        return api.post(`${endpoints.SLIDE}/convert-to-placeholders`, jsonResponse)
    },

    askQuestion: (request: QuestionRequest): Promise<AxiosResponse<ApiResponse<QuestionResponse>>> => {
        return api.post(`${endpoints.SLIDE}/ask`, request)
    },

    askBatchQuestions: (request: BatchQuestionRequest): Promise<AxiosResponse<ApiResponse<BatchQuestionResponse>>> => {
        return api.post(`${endpoints.SLIDE}/ask/batch`, request)
    },

    generateMindmap: (request: MindmapRequest): Promise<AxiosResponse<ApiResponse<MindmapResponse>>> => {
        return api.post(`${endpoints.SLIDE}/mindmap/generate`, request)
    },

    downloadFromUrl: async (url: string, filename: string): Promise<void> => {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to download file from ${url}`)
        }
        const blob = await response.blob()
        downloadBlob(blob, filename)
    },

    getSlideHistory: (
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDir: 'asc' | 'desc' = 'desc',
    ): Promise<AxiosResponse<ApiResponse<SlideHistoryPageResponse>>> => {
        return api.get(`${endpoints.SLIDE}/history`, {
            params: { page, size, sortBy, sortDir },
        })
    },

    getSlideById: (id: number): Promise<AxiosResponse<ApiResponse<SlideGenerationResponse>>> => {
        return api.get(`${endpoints.SLIDE}/history/${id}`)
    },
}

export const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

export const generatePPTXFilename = (topic: string): string => {
    const sanitizedTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const timestamp = new Date().toISOString().split('T')[0]
    return `${sanitizedTopic}_${timestamp}.pptx`
}
