import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/Sonner'
import { ChatService } from '../service/ChatService'
import type { ChatMessageRequest, ChatResponse } from '../type'
import { conversationKeys } from './useChatConversation'

export const useSendMessage = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ChatResponse, any, ChatMessageRequest>({
        mutationFn: async (request: ChatMessageRequest) => {
            const response = await ChatService.sendMessage(request)
            return response.data.data!
        },
        onSuccess: (data, variables) => {
            // Invalidate conversation messages to refetch
            if (data.conversation_id) {
                queryClient.invalidateQueries({
                    queryKey: conversationKeys.detail(data.conversation_id),
                })
            }

            // If it's a new conversation (no conversation_id in request), invalidate list
            if (!variables.conversation_id) {
                queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })
            }

            // Optional: Show success toast with processing time
            if (data.assistant_message.processing_time) {
                const seconds = (data.assistant_message.processing_time / 1000).toFixed(2)
                toast.success({ title: 'Response received', description: `Processed in ${seconds}s` })
            }
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to send message'
            toast.error({ title: 'Message failed', description: errorMessage })
            console.error('Message sending error:', error)
        },
    })

    return {
        sendMessage: mutation.mutate,
        sendMessageAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        data: mutation.data,
        error: mutation.error,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    }
}

/**
 * Hook to send a message without auto-toasts (for custom UI handling)
 *
 * Same as useSendMessage but without automatic toast notifications.
 * Useful when you want to handle UI feedback manually.
 *
 * @example
 * ```typescript
 * const { sendMessage, isPending, data } = useSendMessageSilent()
 *
 * const handleSend = async () => {
 *   try {
 *     const result = await sendMessage({
 *       conversation_id: currentConvId,
 *       message: inputText
 *     })
 *     // Handle success in your own way
 *   } catch (error) {
 *     // Handle error in your own way
 *   }
 * }
 * ```
 */
export const useSendMessageSilent = () => {
    const queryClient = useQueryClient()

    const mutation = useMutation<ChatResponse, any, ChatMessageRequest>({
        mutationFn: async (request: ChatMessageRequest) => {
            const response = await ChatService.sendMessage(request)
            return response.data.data!
        },
        onSuccess: (data, variables) => {
            // Still invalidate queries for data consistency
            if (data.conversation_id) {
                queryClient.invalidateQueries({
                    queryKey: conversationKeys.detail(data.conversation_id),
                })
            }

            if (!variables.conversation_id) {
                queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })
            }
        },
    })

    return {
        sendMessage: mutation.mutate,
        sendMessageAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        data: mutation.data,
        error: mutation.error,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
    }
}
