import { GamesCrudManager } from "@/features/games/components/GameListPage";
import { Header } from "@/layout/header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/apps/games/")({
	component: GamesRoute,
});

function GamesRoute() {
	return (
		<>
			<Header />
			<div className="flex flex-1 flex-col gap-2 p-6 sm:gap-6">
				<GamesCrudManager />
			</div>
		</>
	);
}
