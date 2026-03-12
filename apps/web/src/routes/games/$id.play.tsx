import { createFileRoute } from "@tanstack/react-router";
import { GeneralError } from "@/feature/errors/general-error";
import GamePlayPage from "@/feature/game/components/GamePlayPage";

export const Route = createFileRoute("/games/$id/play")({
	component: function GamePlayRoute() {
		const { id } = Route.useParams();
		const gameId = Number(id);

		if (Number.isNaN(gameId)) {
			return <GeneralError />;
		}

		return <GamePlayPage id={gameId} />;
	},
	errorComponent: () => <GeneralError />,
});
