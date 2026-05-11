import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import ChatAIContent from "../components/ChatAIContent";

interface ChatAIPageProps {
  conversationId?: string;
}

const ChatAIPage: React.FC<ChatAIPageProps> = ({ conversationId }) => {
  return (
    <>
      <PageMeta title="Chat AI - Bitlearning" description="Trợ lý AI chuyên về Tin học từ Bitlearning" />
      <ChatAIContent conversationId={conversationId} />
    </>
  );
};

export default ChatAIPage;
