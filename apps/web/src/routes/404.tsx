import { createFileRoute } from "@tanstack/react-router";
import { NotFoundErrorPage } from "@/feature/app/page/NotFound";

export const Route = createFileRoute("/404")({
	component: RouteComponent,
});

function RouteComponent() {
	return <NotFoundErrorPage />;
}
