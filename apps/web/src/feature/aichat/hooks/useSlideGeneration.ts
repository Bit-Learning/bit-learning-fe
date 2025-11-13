import { useMutation } from '@tanstack/react-query'
import { SlideService, downloadBlob, generatePPTXFilename } from '../service/SlideService'
import type { SlideRequest } from '../type'
import { toast } from 'sonner'

interface GenerateSlideParams {
  templateId: number
  request: SlideRequest
}

/**
 * Custom hook for generating PowerPoint slides with AI
 *
 * Usage:
 * ```typescript
 * const { generateSlides, isGenerating } = useSlideGeneration()
 *
 * generateSlides({
 *   templateId: 1,
 *   request: {
 *     topic: 'Python Basics',
 *     grade: 10,
 *     slide_count: 5
 *   }
 * })
 * ```
 */
export const useSlideGeneration = () => {
  const mutation = useMutation({
    mutationFn: async ({ templateId, request }: GenerateSlideParams) => {
      return await SlideService.generatePPTX(templateId, request)
    },
    onSuccess: (response, variables) => {
      // Automatically download the generated PPTX file
      const filename = generatePPTXFilename(variables.request.topic)
      downloadBlob(response.data, filename)

      toast.success('Slides generated successfully!', {
        description: `Downloaded: ${filename}`
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to generate slides'
      toast.error('Generation failed', {
        description: errorMessage
      })
      console.error('Slide generation error:', error)
    }
  })

  return {
    generateSlides: mutation.mutate,
    generateSlidesAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
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
      toast.success('Preview generated successfully!')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to generate preview'
      toast.error('Preview failed', {
        description: errorMessage
      })
    }
  })

  return {
    previewSlides: mutation.mutate,
    previewSlidesAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    preview: mutation.data,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
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
    onSuccess: (response) => {
      // Download the generated file
      const filename = `custom_slides_${new Date().toISOString().split('T')[0]}.pptx`
      downloadBlob(response.data, filename)

      toast.success('Custom slides generated successfully!', {
        description: `Downloaded: ${filename}`
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to generate custom slides'
      toast.error('Generation failed', {
        description: errorMessage
      })
    }
  })

  return {
    generateCustom: mutation.mutate,
    generateCustomAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
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
        max_sources: 3
      })
      return response.data.data
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to get answer'
      toast.error('Question failed', {
        description: errorMessage
      })
    }
  })

  return {
    askQuestion: mutation.mutate,
    askQuestionAsync: mutation.mutateAsync,
    isAsking: mutation.isPending,
    answer: mutation.data,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
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
        includeExamples: true
      })
      return response.data.data
    },
    onSuccess: () => {
      toast.success('Mindmap generated successfully!')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to generate mindmap'
      toast.error('Mindmap generation failed', {
        description: errorMessage
      })
    }
  })

  return {
    generateMindmap: mutation.mutate,
    generateMindmapAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    mindmap: mutation.data,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  }
}
