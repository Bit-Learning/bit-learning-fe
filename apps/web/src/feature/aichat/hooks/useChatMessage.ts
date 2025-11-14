import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/Sonner'
import { getMessageFromCode, getMessageWithTime, SUCCESS_MESSAGES } from '../constants'
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

            // Show success toast with processing time (if available)
            if (data.assistant_message.processing_time) {
                const message = getMessageWithTime(
                    SUCCESS_MESSAGES.MESSAGE_SENT,
                    data.assistant_message.processing_time,
                )
                toast.success({ title: 'Thành công', description: message })
            }
        },
        onError: (error: any) => {
            // Get error code from response
            const errorCode = error?.response?.data?.code
            const backendMessage = error?.response?.data?.message

            // Map error code to Vietnamese message
            const errorMessage = getMessageFromCode(errorCode, backendMessage)

            toast.error({ title: 'Lỗi gửi tin nhắn', description: errorMessage })
            console.error('Message sending error:', { error, code: errorCode, message: errorMessage })
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
