import { createFileRoute } from "@tanstack/react-router";
import GoogleCallbackPage from "@/feature/auth/page/GoogleCallBackPage";

export const Route = createFileRoute("/auth/google/callback")({
	component: GoogleCallbackPage,
});
