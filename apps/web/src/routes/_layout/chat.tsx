import { createFileRoute } from "@tanstack/react-router";
import ChatPromptPage from "@/feature/aichat/pages/ChatPromptPage";

export const Route = createFileRoute("/_layout/chat")({
	component: ChatPromptPage,
});
