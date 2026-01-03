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

// Conversation Hooks
export {
	conversationKeys,
	useConversation,
	useConversationMessages,
	useConversations,
	useCreateConversation,
	useDeleteConversation,
} from "./useChatConversation";
// Message Hooks
export { useSendMessage, useSendMessageSilent } from "./useChatMessage";
// Mindmaps Hooks
export {
	useMindmapGeneration,
	useMindmapHistory,
} from "./useMindmapGeneration";
// Slide Generation Hooks
export {
	useAskQuestion,
	useCustomSlideGeneration,
	useSlideById,
	useSlideGeneration,
	useSlideHistory,
	useSlidePreview,
} from "./useSlideGeneration";
// Template Hooks
export { useTemplate, useTemplates } from "./useTemplates";
