import { createFileRoute } from "@tanstack/react-router";
import { GeneralError } from "@/feature/errors/general-error";
import { GameListPage } from "@/feature/game/page";

type GameSearchParams = {
	type?: string;
};

export const Route = createFileRoute("/_headerOnly/games/list")({
	component: GameListPage,
	errorComponent: () => <GeneralError />,
	validateSearch: (search: Record<string, unknown>): GameSearchParams => {
		return {
			type: search.type ? String(search.type) : undefined,
		};
	},
});
