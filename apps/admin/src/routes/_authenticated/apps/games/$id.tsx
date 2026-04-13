import { GameDetailPage } from "@/features/games/pages/GameDetailPage";
import { Header } from "@/layout/header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/apps/games/$id")({
	component: GameDetailRoute,
});

function GameDetailRoute() {
	return (
		<>
			<Header />
			<div className="flex flex-1 flex-col gap-2 p-6 sm:gap-6">
				<GameDetailPage />
			</div>
		</>
	);
}
