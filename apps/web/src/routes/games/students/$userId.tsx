import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/games/students/$userId")({
	component: function RedirectToProfile() {
		const { userId } = Route.useParams();
		return <Navigate to="/profile/$username" params={{ username: userId }} />;
	},
});
