import HostLobby from "@/feature/gamification/page/HostLobby";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/host-lobby")({
	component: RouteComponent,
});

function RouteComponent() {
	return <HostLobby />;
}
