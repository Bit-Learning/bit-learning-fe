import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/Sonner'
import { getMessageFromCode, SUCCESS_MESSAGES } from '../constants'
import { SlideService, downloadBlob } from '../service/SlideService'
import type { SlideGenerationResponse, SlideHistoryPageResponse, SlideRequest } from '../type'

interface GenerateSlideParams {
    templateId: number
    request: SlideRequest
}

export const useSlideGeneration = () => {
    const mutation = useMutation<SlideGenerationResponse, any, GenerateSlideParams>({
        mutationFn: async ({ templateId, request }: GenerateSlideParams) => {
            const response = await SlideService.generatePPTX(templateId, request)
            return response.data.data!
        },
        onSuccess: async data => {
            // Download from Cloudinary URL
            try {
                await SlideService.downloadFromUrl(data.cloudinaryUrl, data.filename)

                const cacheIcon = data.fromCache ? '📦 ' : '✨ '
                const cacheStatus = data.fromCache ? 'Lấy từ cache' : 'Đã tạo mới'

                toast.success({
                    title: SUCCESS_MESSAGES.SLIDE_GENERATED,
                    description: `${cacheIcon}${cacheStatus}: ${data.filename}`,
                })
            } catch (downloadError) {
                console.error('Download error:', downloadError)
                toast.error({
                    title: 'Tải xuống thất bại',
                    description: 'Slide đã được tạo nhưng tải xuống thất bại. Vui lòng thử tải lại.',
                })
            }
        },
        onError: (error: any) => {
            const errorCode = error?.response?.data?.code
            const backendMessage = error?.response?.data?.message
            const errorMessage = getMessageFromCode(errorCode, backendMessage)

            toast.error({ title: 'Tạo slide thất bại', description: errorMessage })
            console.error('Slide generation error:', { error, code: errorCode, message: errorMessage })
        },
    })

    return {
        generateSlides: mutation.mutate,
        generateSlidesAsync: mutation.mutateAsync,
        isGenerating: mutation.isPending,
        data: mutation.data,
        error: mutation.error,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    }
}

/**
 * Custom hook for getting JSON preview of slides (without generating PPTX)
 *
 * Usage:
 * ```typescript
 * const { previewSlides, isLoading, preview } = useSlidePreview()
 *
 * previewSlides({
 *   topic: 'Python Basics',
 *   grade: 10,
 *   slide_count: 5
 * })
 * ```
 */
export const useSlidePreview = () => {
    const mutation = useMutation({
        mutationFn: async (request: SlideRequest) => {
            const response = await SlideService.generateJSON(request)
            return response.data.data
        },
        onSuccess: () => {
            toast.success({ title: 'Thành công', description: 'Tạo xem trước slide thành công' })
        },
        onError: (error: any) => {
            const errorCode = error?.response?.data?.code
            const backendMessage = error?.response?.data?.message
            const errorMessage = getMessageFromCode(errorCode, backendMessage)

            toast.error({ title: 'Tạo xem trước thất bại', description: errorMessage })
            console.error('Slide preview error:', { error, code: errorCode, message: errorMessage })
        },
    })

    return {
        previewSlides: mutation.mutate,
        previewSlidesAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        preview: mutation.data,
        error: mutation.error,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    }
}

/**
 * Custom hook for generating custom PPTX with placeholders
 *
 * Usage:
 * ```typescript
 * const { generateCustom, isGenerating } = useCustomSlideGeneration()
 *
 * generateCustom({
 *   template: file,
 *   placeholders: {
 *     title: 'My Title',
 *     content: 'My Content'
 *   }
 * })
 * ```
 */
export const useCustomSlideGeneration = () => {
    const mutation = useMutation({
        mutationFn: async ({ template, placeholders }: { template: File; placeholders: Record<string, string> }) => {
            return await SlideService.generateCustomPPTX(template, placeholders)
        },
        onSuccess: response => {
            // Download the generated file
            const filename = `custom_slides_${new Date().toISOString().split('T')[0]}.pptx`
            downloadBlob(response.data, filename)

            toast.success({
                title: SUCCESS_MESSAGES.SLIDE_GENERATED,
                description: `Đã tải xuống: ${filename}`,
            })
        },
        onError: (error: any) => {
            const errorCode = error?.response?.data?.code
            const backendMessage = error?.response?.data?.message
            const errorMessage = getMessageFromCode(errorCode, backendMessage)

            toast.error({ title: 'Tạo slide tùy chỉnh thất bại', description: errorMessage })
            console.error('Custom slide generation error:', { error, code: errorCode, message: errorMessage })
        },
    })

    return {
        generateCustom: mutation.mutate,
        generateCustomAsync: mutation.mutateAsync,
        isGenerating: mutation.isPending,
        error: mutation.error,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    }
}

/**
 * Custom hook for asking questions to the AI
 *
 * Usage:
 * ```typescript
 * const { askQuestion, isAsking, answer } = useAskQuestion()
 *
 * askQuestion({
 *   question: 'What is polymorphism?',
 *   grade_filter: 10
 * })
 * ```
 */
export const useAskQuestion = () => {
    const mutation = useMutation({
        mutationFn: async (request: { question: string; grade_filter?: number }) => {
            const response = await SlideService.askQuestion({
                question: request.question,
                question_type: 'general',
                grade_filter: request.grade_filter,
                return_sources: true,
                max_sources: 3,
            })
            return response.data.data
        },
        onError: (error: any) => {
            const errorCode = error?.response?.data?.code
            const backendMessage = error?.response?.data?.message
            const errorMessage = getMessageFromCode(errorCode, backendMessage)

            toast.error({ title: 'Trả lời câu hỏi thất bại', description: errorMessage })
            console.error('Question answering error:', { error, code: errorCode, message: errorMessage })
        },
    })

    return {
        askQuestion: mutation.mutate,
        askQuestionAsync: mutation.mutateAsync,
        isAsking: mutation.isPending,
        answer: mutation.data,
        error: mutation.error,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    }
}

/**
 * Custom hook for generating mindmaps
 *
 * Usage:
 * ```typescript
 * const { generateMindmap, isGenerating, mindmap } = useMindmapGeneration()
 *
 * generateMindmap({
 *   topic: 'Photosynthesis',
 *   grade: 10
 * })
 * ```
 */
export const useMindmapGeneration = () => {
    const mutation = useMutation({
        mutationFn: async (request: { topic: string; grade?: number }) => {
            const response = await SlideService.generateMindmap({
                topic: request.topic,
                grade: request.grade,
                maxDepth: 3,
                maxBranches: 6,
                includeExamples: true,
            })
            return response.data.data
        },
        onSuccess: () => {
            toast.success({ title: 'Thành công', description: 'Tạo sơ đồ tư duy thành công' })
        },
        onError: (error: any) => {
            const errorCode = error?.response?.data?.code
            const backendMessage = error?.response?.data?.message
            const errorMessage = getMessageFromCode(errorCode, backendMessage)

            toast.error({ title: 'Tạo sơ đồ tư duy thất bại', description: errorMessage })
            console.error('Mindmap generation error:', { error, code: errorCode, message: errorMessage })
        },
    })

    return {
        generateMindmap: mutation.mutate,
        generateMindmapAsync: mutation.mutateAsync,
        isGenerating: mutation.isPending,
        mindmap: mutation.data,
        error: mutation.error,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    }
}

/**
 * Custom hook for fetching user's slide generation history
 *
 * Usage:
 * ```typescript
 * const { data, isLoading, refetch } = useSlideHistory(0, 10, 'createdAt', 'desc')
 * ```
 */
export const useSlideHistory = (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: 'asc' | 'desc' = 'desc',
) => {
    return useQuery<SlideHistoryPageResponse>({
        queryKey: ['slideHistory', page, size, sortBy, sortDir],
        queryFn: async () => {
            const response = await SlideService.getSlideHistory(page, size, sortBy, sortDir)
            return response.data.data!
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Custom hook for fetching specific slide details by ID
 *
 * Usage:
 * ```typescript
 * const { data, isLoading, refetch } = useSlideById(123)
 * ```
 */
export const useSlideById = (id: number, enabled: boolean = true) => {
    return useQuery<SlideGenerationResponse>({
        queryKey: ['slide', id],
        queryFn: async () => {
            const response = await SlideService.getSlideById(id)
            return response.data.data!
        },
        enabled: enabled && !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
