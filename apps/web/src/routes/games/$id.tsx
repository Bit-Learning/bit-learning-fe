import { GeneralError } from "@/feature/errors/general-error";
import GameDetailPage from "@/feature/game/components/GameDetailPage";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/games/$id")({
	component: function GameDetailRoute() {
		const { id } = useParams({
			from: "/games/$id",
		});
		return <GameDetailPage id={Number.parseInt(id, 10)} />;
	},
	errorComponent: () => <GeneralError />,
});
