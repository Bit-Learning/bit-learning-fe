import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "@/feature/auth/page/ResetPassword";

export const Route = createFileRoute("/reset-password")({
	component: ResetPasswordPage,
});
