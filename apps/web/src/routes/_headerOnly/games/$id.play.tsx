import { createFileRoute } from "@tanstack/react-router";
import { GamePlayPage } from "@/feature/game/page";

export const Route = createFileRoute("/_headerOnly/games/$id/play")({
	component: function GamePlayRoute() {
		const { id } = Route.useParams();
		return <GamePlayPage id={id} />;
	},
});
