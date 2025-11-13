import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/Sonner'
import { ChatService } from '../service/ChatService'
import type {
    ConversationCreateRequest,
    ConversationListResponse,
    ConversationResponse,
    ConversationWithMessagesResponse,
    DeleteResponse,
} from '../type'

/**
 * Query keys for conversation-related queries
 */
export const conversationKeys = {
    all: ['conversations'] as const,
    lists: () => [...conversationKeys.all, 'list'] as const,
    list: (page: number, pageSize: number, includeArchived: boolean) =>
        [...conversationKeys.lists(), { page, pageSize, includeArchived }] as const,
    details: () => [...conversationKeys.all, 'detail'] as const,
    detail: (id: string) => [...conversationKeys.details(), id] as const,
    messages: (id: string, limit?: number) => [...conversationKeys.detail(id), 'messages', { limit }] as const,
}

/**
 * Hook to create a new conversation
 *
 * @example
 * ```typescript
 * const { createConversation, isPending } = useCreateConversation()
 *
 * createConversation({ title: "Learning Python" })
 * // Or with auto-generated title
 * createConversation({})
 * ```
 */
export const useCreateConversation = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ConversationResponse, any, ConversationCreateRequest>({
        mutationFn: async (request: ConversationCreateRequest) => {
            const response = await ChatService.createConversation(request)
            return response.data.data!
        },
        onSuccess: data => {
            // Invalidate conversations list to refetch
            queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })

            toast.success('Conversation created', {
                description: data.title || 'New conversation started',
            })
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to create conversation'
            toast.error('Creation failed', {
                description: errorMessage,
            })
            console.error('Conversation creation error:', error)
        },
    })

    return {
        createConversation: mutation.mutate,
        createConversationAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        data: mutation.data,
        error: mutation.error,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    }
}

/**
 * Hook to get a specific conversation
 *
 * @param conversationId - Conversation UUID
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useConversation('conv-uuid-123')
 *
 * if (data) {
 *   console.log(data.title)
 *   console.log(data.message_count)
 * }
 * ```
 */
export const useConversation = (conversationId: string) => {
    return useQuery<ConversationResponse, any>({
        queryKey: conversationKeys.detail(conversationId),
        queryFn: async () => {
            const response = await ChatService.getConversation(conversationId)
            return response.data.data!
        },
        enabled: !!conversationId, // Only fetch if conversationId exists
        staleTime: 30000, // 30 seconds
    })
}

/**
 * Hook to list conversations with pagination
 *
 * @param page - Page number (1-indexed, default: 1)
 * @param pageSize - Items per page (default: 20)
 * @param includeArchived - Include archived conversations (default: false)
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useConversations(1, 20, false)
 *
 * if (data) {
 *   console.log(data.conversations)
 *   console.log(`Total: ${data.total}`)
 * }
 * ```
 */
export const useConversations = (page: number = 1, pageSize: number = 20, includeArchived: boolean = false) => {
    return useQuery<ConversationListResponse, any>({
        queryKey: conversationKeys.list(page, pageSize, includeArchived),
        queryFn: async () => {
            const response = await ChatService.listConversations(page, pageSize, includeArchived)
            return response.data.data!
        },
        staleTime: 30000, // 30 seconds
    })
}

/**
 * Hook to get conversation messages
 *
 * @param conversationId - Conversation UUID
 * @param limit - Optional limit on number of messages
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useConversationMessages('conv-uuid-123', 50)
 *
 * if (data) {
 *   console.log(data.conversation)
 *   console.log(data.messages)
 * }
 * ```
 */
export const useConversationMessages = (conversationId: string, limit?: number) => {
    return useQuery<ConversationWithMessagesResponse, any>({
        queryKey: conversationKeys.messages(conversationId, limit),
        queryFn: async () => {
            const response = await ChatService.getConversationMessages(conversationId, limit)
            return response.data.data!
        },
        enabled: !!conversationId, // Only fetch if conversationId exists
        staleTime: 10000, // 10 seconds
    })
}

/**
 * Hook to delete a conversation
 *
 * @example
 * ```typescript
 * const { deleteConversation, isPending } = useDeleteConversation()
 *
 * deleteConversation('conv-uuid-123')
 * ```
 */
export const useDeleteConversation = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<DeleteResponse, any, string>({
        mutationFn: async (conversationId: string) => {
            const response = await ChatService.deleteConversation(conversationId)
            return response.data.data!
        },
        onSuccess: (data, conversationId) => {
            // Invalidate conversations list to refetch
            queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })

            // Remove the specific conversation from cache
            queryClient.removeQueries({ queryKey: conversationKeys.detail(conversationId) })

            toast.success('Conversation deleted', {
                description: data.message || 'Conversation and all messages removed',
            })
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to delete conversation'
            toast.error('Deletion failed', {
                description: errorMessage,
            })
            console.error('Conversation deletion error:', error)
        },
    })

    return {
        deleteConversation: mutation.mutate,
        deleteConversationAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        data: mutation.data,
        error: mutation.error,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    }
}
