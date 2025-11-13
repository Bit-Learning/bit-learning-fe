import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/Sonner'
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
                const cacheStatus = data.fromCache ? 'Retrieved from cache' : 'Generated'

                toast.success({ title: 'Slides ready!', description: `${cacheIcon}${cacheStatus}: ${data.filename}` })
            } catch (downloadError) {
                console.error('Download error:', downloadError)
                toast.error({
                    title: 'Download failed',
                    description: 'Slide was generated but download failed. Try downloading manually.',
                    // action: {
                    //     label: 'Open URL',
                    //     onClick: () => window.open(data.cloudinaryUrl, '_blank'),
                    // },
                })
            }
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to generate slides'
            toast.error({ title: 'Generation failed', description: errorMessage })
            console.error('Slide generation error:', error)
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
            toast.success({ title: 'Preview generated successfully!' })
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to generate preview'
            toast.error({ title: 'Preview failed', description: errorMessage })
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

            toast.success({ title: 'Custom slides generated successfully!', description: `Downloaded: ${filename}` })
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to generate custom slides'
            toast.error({ title: 'Generation failed', description: errorMessage })
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
            const errorMessage = error?.response?.data?.message || 'Failed to get answer'
            toast.error({ title: 'Question failed', description: errorMessage })
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
            toast.success({ title: 'Mindmap generated successfully!' })
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to generate mindmap'
            toast.error({ title: 'Mindmap generation failed', description: errorMessage })
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
