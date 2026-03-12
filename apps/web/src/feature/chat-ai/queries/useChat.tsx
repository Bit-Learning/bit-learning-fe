import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../apis/chat.api";
import { useAppDispatch } from "@/shared/redux/store";
import {
  addMessageAction,
  prependMessagesAction,
  setCurrentConversationAction,
  setMessagesAction,
} from "../stores/chat.store";
import type { ChatRequest, ChatResult, CreateConversationRequest, Message } from "../types/chat.type";

export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  conversationsList: (page: number, size: number) => [...chatKeys.conversations(), page, size] as const,
  conversation: (id: string) => [...chatKeys.all, "conversation", id] as const,
  messages: (conversationId: string, before?: number) => [...chatKeys.all, "messages", conversationId, before] as const,
};

export const useUserConversations = (page = 0, size = 10) => {
  return useQuery({
    queryKey: chatKeys.conversationsList(page, size),
    queryFn: async () => {
      const response = await chatApi.getUserConversations(page, size);
      return response.data;
    },
  });
};

export const useConversation = (id: string) => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: chatKeys.conversation(id),
    queryFn: async () => {
      const response = await chatApi.getConversation(id);
      if (response.data.data) {
        dispatch(setCurrentConversationAction(response.data.data));
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useConversationMessages = (conversationId: string, size = 20, before?: number) => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: chatKeys.messages(conversationId, before),
    queryFn: async () => {
      const response = await chatApi.getConversationMessages(conversationId, size, before);
      const chatResults: ChatResult[] = response.data.data?.messages || [];

      const messages: Message[] = chatResults.map((result) => ({
        id: result.id,
        role: result.role,
        content: result.answer,
        model: result.model,
        promptToken: result.prompt_tokens,
        completionToken: result.completion_tokens,
        totalToken: result.total_tokens,
        sources: result.sources ? [result.sources] : undefined,
        attachments: result.attachments,
        createdAt: result.created_at,
      }));

      if (before) {
        dispatch(prependMessagesAction(messages));
      } else {
        dispatch(setMessagesAction(messages));
      }

      return response.data;
    },
    enabled: !!conversationId,
    refetchOnMount: 'always',
    staleTime: 0,
  });
};

export const useCreateConversation = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateConversationRequest) => chatApi.createConversation(request),
    onSuccess: (response) => {
      if (response.data.data) {
        dispatch(setCurrentConversationAction(response.data.data));
      }
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
};

export const useDeleteConversation = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => chatApi.deleteConversation(id),
    onSuccess: () => {
      dispatch(setCurrentConversationAction(null));
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
};

export const useSendMessage = (conversationId: string) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ChatRequest) => chatApi.sendMessage(conversationId, request),
    onSuccess: (response) => {
      const result = response.data.data;
      if (result) {
        const assistantMessage: Message = {
          id: result.id ?? Date.now(),
          role: result.role ?? "assistant",
          content: result.answer,
          model: result.model,
          promptToken: result.prompt_tokens,
          completionToken: result.completion_tokens,
          totalToken: result.total_tokens,
          sources: result.sources ? [result.sources] : undefined,
          attachments: result.attachments,
          createdAt: result.created_at ?? new Date().toISOString(),
        };
        dispatch(addMessageAction(assistantMessage));
      }
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      });
    },
  });
};
