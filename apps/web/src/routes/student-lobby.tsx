import StudentLobby from "@/feature/gamification/page/StudentLobby";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/student-lobby")({
	component: RouteComponent,
});

function RouteComponent() {
	return <StudentLobby />;
}
