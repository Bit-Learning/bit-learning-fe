import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/clerk/(auth)")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/clerk/(auth)"!</div>;
}
