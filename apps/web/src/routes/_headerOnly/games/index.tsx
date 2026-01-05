import { createFileRoute } from "@tanstack/react-router";
import { GeneralError } from "@/feature/errors/general-error";
import { GameDashboardPage } from "@/feature/game/page";

type GameSearchParams = {
	type?: string;
};

export const Route = createFileRoute("/_headerOnly/games/")({
	component: GameDashboardPage,
	errorComponent: () => <GeneralError />,
	staticData: {
		headerStyle: "game",
	},
	validateSearch: (search: Record<string, unknown>): GameSearchParams => {
		return {
			type: (search.type as string) || undefined,
		};
	},
});
