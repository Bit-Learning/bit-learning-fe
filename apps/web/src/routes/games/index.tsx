import { GeneralError } from "@/feature/errors/general-error";
import GameList from "@/feature/game/components/GameList";
import { requireAuth } from "@/shared/lib/auth-utils";
import { createFileRoute } from "@tanstack/react-router";

type GameSearchParams = {
	type?: string;
};

export const Route = createFileRoute("/games/")({
	beforeLoad: async ({ location }) => {
		requireAuth(location);
	},
	component: () => <GameList />,
	errorComponent: () => <GeneralError />,
	validateSearch: (search: Record<string, unknown>): GameSearchParams => {
		return {
			type: (search.type as string) || undefined,
		};
	},
});
