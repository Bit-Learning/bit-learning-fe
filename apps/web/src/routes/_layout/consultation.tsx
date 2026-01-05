import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/consultation")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/consultation"!</div>;
}
