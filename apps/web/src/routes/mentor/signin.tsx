import MentorSignInPage from "@/feature/auth/page/MentorLogin";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentor/signin")({
	component: MentorSignInPage,
});
