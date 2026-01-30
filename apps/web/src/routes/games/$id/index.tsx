import { createFileRoute } from "@tanstack/react-router";
import { NotFoundErrorPage } from "@/feature/app/page/NotFound";
import { GameDetailPage } from "@/feature/gamification/page";

export const Route = createFileRoute("/games/$id/")({
	component: function GameDetailRoute() {
		const { id } = Route.useParams();
		return <GameDetailPage id={id} />;
	},
	errorComponent: () => <NotFoundErrorPage />,
});
