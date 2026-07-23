import { createFileRoute } from "@tanstack/react-router";
import { NotFoundErrorPage } from "@/feature/app/pages/NotFound";

export const Route = createFileRoute("/404")({
	component: RouteComponent,
});

function RouteComponent() {
	return <NotFoundErrorPage />;
}
