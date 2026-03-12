import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { addMessageAction, clearChatAction, clearMessagesAction, selectCurrentConversation, selectMessages, setCurrentConversationAction } from "../stores/chat.store";
import { useCreateConversation, useSendMessage, useUserConversations, useConversationMessages } from "../queries/useChat";
import IntroView from "./IntroView";
import ChatView from "./ChatView";
import ChatSidebar from "./ChatSidebar";
import type { Message, Conversation } from "../types/chat.type";
import { useAppDispatch } from "@/shared/redux/store";
import { useSelector } from "react-redux";

const ChatAIContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentConversation = useSelector(selectCurrentConversation);
  const messages = useSelector(selectMessages);

  const [currentView, setCurrentView] = useState<"intro" | "chat">("intro");
  const [inputValue, setInputValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversationsData } = useUserConversations(0, 10);
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage(currentConversation?.id || "");

  // Load messages khi có conversation
  const { isLoading: isLoadingMessages } = useConversationMessages(
    currentConversation?.id || "",
    20
  );

  const conversations = conversationsData?.data || [];

  // Effect để chuyển sang chat view khi có currentConversation và messages
  useEffect(() => {
    if (currentConversation && messages.length > 0) {
      setCurrentView("chat");
    }
  }, [currentConversation, messages.length]);

  const handleSelectConversation = (conversation: Conversation) => {
    // Clear messages cũ trước khi chuyển sang conversation mới
    dispatch(clearMessagesAction());
    // Set conversation mới
    dispatch(setCurrentConversationAction(conversation));
    setCurrentView("chat");
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      createdAt: new Date().toISOString(),
      attachments: files.map((file) => ({
        fileName: file.name,
        fileUrl: "",
        fileType: file.type,
        fileSize: file.size,
      })),
    };

    dispatch(addMessageAction(userMessage));
    setInputValue("");
    setCurrentView("chat");

    let conversationId = currentConversation?.id;
    if (!conversationId) {
      try {
        const response = await createConversation.mutateAsync({
          title: inputValue.substring(0, 50),
        });
        conversationId = response.data.data?.id;
      } catch (error) {
        console.error("Failed to create conversation:", error);
        return;
      }
    }

    if (conversationId) {
      try {
        await sendMessage.mutateAsync({
          question: inputValue,
          files: files.length > 0 ? files : undefined,
        });
        setFiles([]);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleNewChat = () => {
    dispatch(clearChatAction());
    setCurrentView("intro");
    setInputValue("");
    setFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isLoading = sendMessage.isPending || createConversation.isPending;

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-900">
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      />

      <main className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {currentView === "intro" ? (
          <IntroView onQuickQuestion={handleQuickQuestion} />
        ) : (
          <ChatView messages={messages} />
        )}

        <div className="p-6 md:pb-12 max-w-4xl mx-auto w-full">
          <div className="relative group">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus-within:shadow-md focus-within:ring-2 ring-blue-500/20 transition-all">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="w-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 p-4 pb-12 resize-none outline-none disabled:opacity-50"
                placeholder="Hỏi bất cứ điều gì về Tin học..."
                rows={1}
                style={{ minHeight: "60px", maxHeight: "200px" }}
              />
              <div className="absolute bottom-3 right-4 flex items-center gap-3">
                <div className="text-[10px] text-slate-400 hidden sm:block">
                  AI có thể cung cấp thông tin không chính xác.
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatAIContent;
