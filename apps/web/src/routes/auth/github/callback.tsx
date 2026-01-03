import { createFileRoute } from "@tanstack/react-router";
import GitHubCallbackPage from "@/feature/auth/page/GitHubCallBackPage";

export const Route = createFileRoute("/auth/github/callback")({
	component: GitHubCallbackPage,
});
