import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/Sonner'
import { interactionApi } from '../api/interaction.api'
import { CommentRequest, ReviewRequest } from '../types/interaction.type'

export const interactionKeys = {
    all: ['interactions'] as const,
    comments: (lectureId: number) => [...interactionKeys.all, 'comments', lectureId] as const,
    replies: (parentId: number) => [...interactionKeys.all, 'replies', parentId] as const,
    reviews: (courseId: number) => [...interactionKeys.all, 'reviews', courseId] as const,
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

// Review Hooks
export const useCourseReviews = (courseId: number, page = 0, size = 5, sort = 'createdAt', direction = 'DESC') => {
    return useQuery({
        queryKey: [...interactionKeys.reviews(courseId), page, size, sort, direction],
        queryFn: async () => {
            const response = await interactionApi.getCourseReviews(courseId, page, size, sort, direction)
            return {
                content: response.data || [],
                page: response.page || {
                    page: 0,
                    size: 5,
                    totalElements: 0,
                    totalPages: 0,
                    first: true,
                    last: true,
                },
            }
        },
        enabled: !!courseId,
    })
}

export const usePostReview = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (request: ReviewRequest) => {
            const response = await interactionApi.postReview(request)
            return response.data
        },
        onSuccess: (_, variables) => {
            toast.success({ title: 'Đã gửi đánh giá thành công' })

            queryClient.invalidateQueries({
                queryKey: interactionKeys.reviews(variables.courseId),
            })
        },
        onError: (error: any) => {
            toast.error({
                title: 'Không thể gửi đánh giá',
                description: error?.response?.data?.message || 'Đã có lỗi xảy ra',
            })
        },
    })
}
