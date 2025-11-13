import api from '@/shared/api/api'
import { endpoints } from '@/shared/constants/endpoints'
import { AxiosResponse } from 'axios'
import type {
  ApiResponse,
  ChatMessageRequest,
  ChatResponse,
  ConversationCreateRequest,
  ConversationResponse,
  ConversationListResponse,
  ConversationWithMessagesResponse,
  DeleteResponse,
} from '../type'

/**
 * ChatService - API service for chat and conversation management
 *
 * Provides methods for:
 * - Creating and listing conversations
 * - Sending messages with AI responses
 * - Retrieving conversation messages
 * - Managing conversation history
 */
export const ChatService = {
  /**
   * Create a new conversation
   *
   * @param request - Conversation creation request (title is optional)
   * @returns Promise with conversation details
   *
   * @example
   * ```typescript
   * // Create with custom title
   * ChatService.createConversation({ title: "Learning Python" })
   *
   * // Create with auto-generated title
   * ChatService.createConversation({})
   * ```
   */
  createConversation: (
    request: ConversationCreateRequest
  ): Promise<AxiosResponse<ApiResponse<ConversationResponse>>> => {
    return api.post(`${endpoints.CHAT}/conversations`, request)
  },

  /**
   * Get a specific conversation
   *
   * @param conversationId - Conversation UUID
   * @returns Promise with conversation details
   *
   * @example
   * ```typescript
   * ChatService.getConversation('conv-uuid-123')
   * ```
   */
  getConversation: (
    conversationId: string
  ): Promise<AxiosResponse<ApiResponse<ConversationResponse>>> => {
    return api.get(`${endpoints.CHAT}/conversations/${conversationId}`)
  },

  /**
   * List conversations for the authenticated user
   *
   * @param page - Page number (1-indexed)
   * @param pageSize - Items per page (default: 20)
   * @param includeArchived - Include archived conversations (default: false)
   * @returns Promise with paginated conversation list
   *
   * @example
   * ```typescript
   * ChatService.listConversations(1, 20, false)
   * ```
   */
  listConversations: (
    page: number = 1,
    pageSize: number = 20,
    includeArchived: boolean = false
  ): Promise<AxiosResponse<ApiResponse<ConversationListResponse>>> => {
    return api.get(`${endpoints.CHAT}/conversations`, {
      params: {
        page,
        page_size: pageSize,
        include_archived: includeArchived,
      },
    })
  },

  /**
   * Get messages for a specific conversation
   *
   * @param conversationId - Conversation UUID
   * @param limit - Optional limit on number of messages
   * @returns Promise with conversation and messages
   *
   * @example
   * ```typescript
   * ChatService.getConversationMessages('conv-uuid-123', 50)
   * ```
   */
  getConversationMessages: (
    conversationId: string,
    limit?: number
  ): Promise<AxiosResponse<ApiResponse<ConversationWithMessagesResponse>>> => {
    return api.get(`${endpoints.CHAT}/conversations/${conversationId}/messages`, {
      params: limit ? { limit } : {},
    })
  },

  /**
   * Send a message and get AI response
   *
   * @param request - Message request with optional conversation_id
   * @returns Promise with user message and AI response
   *
   * @example
   * ```typescript
   * // Start new conversation
   * ChatService.sendMessage({
   *   message: "What is a variable?",
   *   grade: 8,
   *   return_sources: true,
   *   max_history: 10
   * })
   *
   * // Continue existing conversation
   * ChatService.sendMessage({
   *   conversation_id: "conv-uuid-123",
   *   message: "Can you give me an example?",
   *   return_sources: true
   * })
   * ```
   */
  sendMessage: (
    request: ChatMessageRequest
  ): Promise<AxiosResponse<ApiResponse<ChatResponse>>> => {
    return api.post(`${endpoints.CHAT}/messages`, request)
  },

  /**
   * Delete a conversation and all its messages permanently
   *
   * @param conversationId - Conversation UUID to delete
   * @returns Promise with deletion confirmation
   *
   * @example
   * ```typescript
   * ChatService.deleteConversation('conv-uuid-123')
   * ```
   */
  deleteConversation: (
    conversationId: string
  ): Promise<AxiosResponse<ApiResponse<DeleteResponse>>> => {
    return api.delete(`${endpoints.CHAT}/conversations/${conversationId}`)
  },
}
