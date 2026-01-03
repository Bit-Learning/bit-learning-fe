import { createFileRoute } from "@tanstack/react-router";
import SignUpPage from "@/feature/auth/page/Register";

export const Route = createFileRoute("/signup")({
	component: SignUpPage,
});
