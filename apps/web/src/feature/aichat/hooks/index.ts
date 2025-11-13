/**
 * AI Chat Hooks - Centralized exports
 *
 * This file exports all hooks for the AI Chat feature:
 * - Slide generation hooks
 * - Template management hooks
 * - Conversation management hooks
 * - Message sending hooks
 * - Q&A hooks
 * - Mindmap generation hooks
 */

// Slide Generation Hooks
export {
  useSlideGeneration,
  useSlidePreview,
  useCustomSlideGeneration,
  useAskQuestion,
  useMindmapGeneration,
  useSlideHistory,
  useSlideById,
} from './useSlideGeneration'

// Template Hooks
export { useTemplates, useTemplate } from './useTemplates'

// Conversation Hooks
export {
  useCreateConversation,
  useConversation,
  useConversations,
  useConversationMessages,
  useDeleteConversation,
  conversationKeys,
} from './useChatConversation'

// Message Hooks
export { useSendMessage, useSendMessageSilent } from './useChatMessage'
