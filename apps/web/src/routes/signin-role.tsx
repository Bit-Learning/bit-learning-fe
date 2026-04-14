import { createFileRoute } from "@tanstack/react-router";
import SignInPage from "@/feature/auth/page/Login";

export const Route = createFileRoute("/signin-role")({
	component: SignInPage,
});
