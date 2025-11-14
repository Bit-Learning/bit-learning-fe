import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/Sonner'
import { MindmapService, type MindmapGenerationRequest, type MindmapResponse } from '../service/MindmapService'

interface UseMindmapGenerationReturn {
    generateMindmap: (request: MindmapGenerationRequest) => void
    generateMindmapAsync: (request: MindmapGenerationRequest) => Promise<MindmapResponse>
    isGenerating: boolean
}

export const useMindmapGeneration = (): UseMindmapGenerationReturn => {
    const mutation = useMutation<MindmapResponse, any, MindmapGenerationRequest>({
        mutationFn: async (request: MindmapGenerationRequest) => {
            const response = await MindmapService.generateMindmap(request)
            return response.data.data!
        },
        onSuccess: data => {
            toast.success({
                title: 'Mind Map đã sẵn sàng!',
                description: `✨ ${data.title} đã được tạo thành công.`,
            })
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Không thể tạo mind map'
            toast.error({
                title: 'Tạo mind map thất bại',
                description: errorMessage,
            })
            console.error('Mind map generation error:', error)
        },
    })

    return {
        generateMindmap: mutation.mutate,
        generateMindmapAsync: mutation.mutateAsync,
        isGenerating: mutation.isPending,
    }
}

export const useMindmapHistory = (userId: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['mindmapHistory', userId],
        queryFn: async () => {
            const response = await MindmapService.getMindmapHistory(userId)
            return response.data.data!
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    return { data, isLoading, error }
}
