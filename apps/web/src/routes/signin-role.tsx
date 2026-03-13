import { createFileRoute } from "@tanstack/react-router";
import RoleSelectPage from "@/feature/auth/page/RoleSelect";

export const Route = createFileRoute("/signin-role")({
	component: RoleSelectPage,
});
