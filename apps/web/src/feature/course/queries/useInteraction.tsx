// Hooks file: feature/course/queries/useInteraction.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/Sonner'
import { interactionApi } from '../api/interaction.api'
import { CommentRequest } from '../types/interaction.type'

export const interactionKeys = {
    all: ['interactions'] as const,
    comments: (lectureId: number) => [...interactionKeys.all, 'comments', lectureId] as const,
    replies: (parentId: number) => [...interactionKeys.all, 'replies', parentId] as const,
}

export const useRootComments = (lectureId: number, page = 0, size = 10, sort = 'upVotes', direction = 'DESC') => {
    return useQuery({
        queryKey: [...interactionKeys.comments(lectureId), page, size, sort, direction],
        queryFn: async () => {
            const response = await interactionApi.getRootComments(lectureId, page, size, sort, direction)
            return {
                content: response.data || [],
                page: response.page || {
                    page: 0,
                    size: 10,
                    totalElements: 0,
                    totalPages: 0,
                    first: true,
                    last: true,
                },
            }
        },
        enabled: !!lectureId,
    })
}

export const useReplies = (parentId: number, enabled = false) => {
    return useQuery({
        queryKey: interactionKeys.replies(parentId),
        queryFn: async () => {
            const response = await interactionApi.getReplies(parentId)
            return response.data || []
        },
        enabled: enabled && !!parentId,
    })
}

export const usePostComment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (request: CommentRequest) => {
            const response = await interactionApi.postComment(request)
            return response.data
        },
        onSuccess: (_, variables) => {
            toast.success({ title: 'Đã đăng bình luận thành công' })

            queryClient.invalidateQueries({
                queryKey: interactionKeys.comments(variables.lectureId),
            })

            if (variables.parentId) {
                queryClient.invalidateQueries({
                    queryKey: interactionKeys.replies(variables.parentId),
                })
            }
        },
        onError: (error: any) => {
            toast.error({
                title: 'Không thể đăng bình luận',
                description: error?.response?.data?.message || 'Đã có lỗi xảy ra',
            })
        },
    })
}

export const useToggleVote = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (commentId: number) => interactionApi.toggleVote(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: interactionKeys.all,
            })
        },
        onError: (error: any) => {
            toast.error({
                title: 'Không thể thực hiện thao tác',
                description: error?.response?.data?.message || 'Đã có lỗi xảy ra',
            })
        },
    })
}
