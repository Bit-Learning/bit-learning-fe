import { createFileRoute } from "@tanstack/react-router";
import AIChatbotPage from "@/feature/aichat/pages/AIChatbotPage";

export const Route = createFileRoute("/_headerOnly/ai-chatbot")({
	component: AIChatbotPage,
});
