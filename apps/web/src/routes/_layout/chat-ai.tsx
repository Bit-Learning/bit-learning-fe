import ChatAIPage from "@/feature/chat-ai/pages/ChatAI";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/chat-ai")({
  component: ChatAIPage,
});
