import { createFileRoute } from "@tanstack/react-router";
import { NotFoundErrorPage } from "@/feature/app/page/NotFound";
import { GameDetailPage } from "@/feature/game/page";

export const Route = createFileRoute("/_headerOnly/games/$id/")({
	component: function GameDetailRoute() {
		const { id } = Route.useParams();
		return <GameDetailPage id={id} />;
	},
	errorComponent: () => <NotFoundErrorPage />,
});
