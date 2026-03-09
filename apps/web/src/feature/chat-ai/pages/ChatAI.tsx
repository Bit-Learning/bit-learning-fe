import type React from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import ChatAIContent from "../components/ChatAIContent";

const ChatAIPage: React.FC = () => {
  return (
    <>
      <PageMeta title="Chat AI - Bitlearning" description="Trợ lý AI chuyên về Tin học từ Bitlearning" />
      <ChatAIContent />
    </>
  );
};

export default ChatAIPage;
