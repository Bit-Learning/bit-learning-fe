import ChatAIPage from "@/feature/chat-ai/pages/ChatAI";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_headerOnly/chat-ai/")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: ChatAIPage,
});
